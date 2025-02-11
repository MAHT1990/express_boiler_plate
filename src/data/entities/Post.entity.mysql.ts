/* THIRD-PARTY MODULES */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { CommentMySQLEntity } from "./Comment.entity.mysql";

@Entity()
export class PostMySQLEntity {

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

    @OneToMany(() => CommentMySQLEntity, comment => comment.post)
    comments: CommentMySQLEntity[];

}
