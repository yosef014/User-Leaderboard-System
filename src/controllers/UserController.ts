import {Request, Response} from 'express'
import {User} from "../entities/User"
import redis from "../helpers/Redis"
import {In} from "typeorm"

const LEADERBOARD_KEY = "leaderboard"


class UserController {
    createUser = async (req: Request, res: Response) => {
        try {
            const { username, avatar_url, score } = req.body
            if (!username) {
                return res.status(400).json({ error: "username is required" })
            }

            const user = await User.create({
                username,
                avatar_url: avatar_url,
                score: Number(score) || 0
            }).save()
            await redis.zadd(LEADERBOARD_KEY, user.score, String(user.id))
            res.status(201).json(user)

        } catch (e) {
            console.error(e)
            res.status(500).json({ error: "internal error" })
        }
    }

    updateScore = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const { score } = req.body
            const user = await User.findOneBy({ id: Number(id) })
            if (!user) return res.status(404).json({ error: "User not found" })

            const numericScore = Number(score)
            if (isNaN(numericScore)) {
                return res.status(400).json({ error: "Invalid score" })
            }


            await Promise.all([
                User.update(user.id, { score: numericScore }),
                redis.zadd(LEADERBOARD_KEY, numericScore, String(user.id)),
            ])

            res.status(200).json({ message: "success" })
        } catch (e) {
            console.error(e)
            res.status(500).json({ error: "internal error" })
        }
    }

    getTopN = async (req: Request, res: Response) => {
        try {
            const N = Math.max(1, Number(req.query.n) || 10)

            const userIdsWithScores = await redis.zrevrange(LEADERBOARD_KEY, 0, N - 1, "WITHSCORES")
            const userIds = []
            for (let i = 0; i < userIdsWithScores.length; i += 2) {
                userIds.push(Number(userIdsWithScores[i]))
            }
            const users = await User.findBy({ id: In(userIds) })


            /** without redis */
            // const users = await User.createQueryBuilder("user")
            //     .orderBy("user.score", "DESC")
            //     .addOrderBy("user.id", "ASC")
            //     .limit(N)
            //     .getMany()

            res.json(users)
        } catch (e) {
            console.error(e)
            res.status(500).json({ error: "internal error" })
        }
    }
    getUserRank = async (req: Request, res: Response) => {
        try {
            const { id } = req.params

            const rank = await redis.zrevrank(LEADERBOARD_KEY, id)
            if (rank === null) return res.status(404).json({ error: "User not found in leaderboard" })


            const start = Math.max(0, rank - 5)
            const end = rank + 5

            const userIdsWithScores = await redis.zrevrange(LEADERBOARD_KEY, start, end, "WITHSCORES")
            const ids: number[] = []
            for (let i = 0; i < userIdsWithScores.length; i += 2) {
                ids.push(Number(userIdsWithScores[i]))
            }


            const usersFromDb = await User.findBy({ id: In(ids) })
            const usersMap = new Map(usersFromDb.map(user => [user.id, user]))

            const users = []
            for (let i = 0; i < userIdsWithScores.length; i += 2) {
                const userId = Number(userIdsWithScores[i])
                const score = Number(userIdsWithScores[i + 1])
                const user = usersMap.get(userId)
                if (user) {
                    users.push({
                        id: user.id,
                        username: user.username,
                        avatar_url: user.avatar_url,
                        score,
                        rank: start + (i / 2) + 1, // to start from 1
                    })
                }
            }


            res.json({
                userRank: rank + 1, // to start from 1
                surrounding: users,
            })
        } catch (e) {
            console.error(e)
            res.status(500).json({ error: "internal error" })
        }
    }

    // getUserWithNeighborsDb = async (req: Request, res: Response) => {
    //     try {
    //         const { id } = req.params
    //         // rank = COUNT(*) + 1 WHERE score > user's score OR (score = user's score AND id < user's id)
    //         const user = await User.findOneBy({ id: Number(id) })
    //         if (!user) return res.status(404).json({ error: "User not found" })
    //
    //         const rankQuery = await AppDataSource.manager.query(`
    //             SELECT COUNT(*) + 1 as rank
    //             FROM users
    //             WHERE (score > $1) OR (score = $1 AND id < $2)
    //         `, [user.score, user.id])
    //         const userRank = Number(rankQuery[0]?.rank)
    //
    //         // Select 5 above, user, and 5 below
    //         const neighbors = await AppDataSource.manager.query(`
    //             SELECT *,
    //                 RANK() OVER (ORDER BY score DESC, id ASC) as rank
    //             FROM users
    //             ORDER BY score DESC, id ASC
    //             LIMIT 11 OFFSET GREATEST($1 - 6, 0)
    //         `, [userRank])
    //
    //         res.json({
    //             user,
    //             rank: userRank,
    //             neighbors
    //         })
    //     } catch (e) {
    //         console.error(e)
    //         res.status(500).json({ error: "internal error" })
    //     }
    // }



}

export default new UserController()