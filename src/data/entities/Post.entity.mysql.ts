/* THIRD-PARTY MODULES */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { CommentMySQLEntity } from "./Comment.entity.mysql";

@Entity({ name: "post_mysql_entity"})
export class PostMySQLEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: "title",
        type: "varchar",
    })
    title: string

    @Column({
        name: "content",
        type: "text",
    })
    content: string

    @Column({
        name: "author",
        type: "varchar",
    })
    author: string

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt: Date

    @OneToMany(() => CommentMySQLEntity, comment => comment.post)
    comments: CommentMySQLEntity[];

}
