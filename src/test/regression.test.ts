import request from "supertest"

const BASE = "http://localhost:4000"

describe("Leaderboard API Regression", () => {
    let users: any[] = []

    it("creates 20 users", async () => {
        for (let i = 1; i <= 20; i++) {
            const username = `user${i}`
            const avatar_url = `https://api.adorable.io/avatars/50/user${i}.png`
            const score = Math.floor(Math.random() * 1000)
            const res = await request(BASE)
                .post("/api/users/create")
                .send({ username, avatar_url, score })
            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty("id")
            users.push({ ...res.body, originalScore: score })
        }
    })

    it("updates each user's score", async () => {
        for (let i = 0; i < users.length; i++) {
            const newScore = Math.floor(Math.random() * 5000) + 1000;
            const res = await request(BASE)
                .put(`/api/users/${users[i].id}/score`)
                .send({ score: newScore })
            expect(res.status).toBe(200)
            users[i].updatedScore = newScore
        }
    })

    it("gets top 10 users", async () => {
        const res = await request(BASE).get("/api/users/top?n=10")
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeLessThanOrEqual(10)
    })

    it("gets rank and neighbors for a random user", async () => {
        const sample = users[Math.floor(Math.random() * users.length)]
        const res = await request(BASE).get(`/api/users/${sample.id}/rank`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("userRank")
        expect(res.body).toHaveProperty("surrounding")
        expect(Array.isArray(res.body.surrounding)).toBe(true)
        // Should contain the user himself in surrounding
        expect(res.body.surrounding.map(u => u.id)).toContain(sample.id)
    })
})
