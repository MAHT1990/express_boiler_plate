/* THIRD-PARTY MODULES */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { PostMySQLEntity } from "./Post.entity.mysql";

@Entity({ name: "comment_mysql_entity"})
export class CommentMySQLEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: "content",
        type: "text",
    })
    content: string;

    @Column({
        name: "author",
        type: "varchar",
    })
    author: string;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt: Date;
    
    @Column({
        name: "post_id",
        type: "int",
    })
    postId: number;

    /* RELATIONSHIP */
    @ManyToOne(() => PostMySQLEntity, post => post.comments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'postId' })
    post: PostMySQLEntity;

} 