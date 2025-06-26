import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";

@Entity({ name: "users" })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    username: string;

    @Column({ nullable: true })
    avatar_url: string;

    @Column({ type: "bigint", default: 0 })
    score: number;

    @CreateDateColumn({})
    created_at: Date;
}
