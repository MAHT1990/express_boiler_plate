/* THIRD-PARTY MODULES */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Comment } from "./Comment.entity.mysql";

@Entity()
export class Post {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    content: string

    @Column()
    author: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn() 
    updatedAt: Date

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

}
