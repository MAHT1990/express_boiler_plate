/* THIRD-PARTY MODULES */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { PostMySQLEntity } from "./Post.entity.mysql";

@Entity()
export class CommentMySQLEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @Column()
    author: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @Column()
    postId: number;

    @ManyToOne(() => PostMySQLEntity, post => post.comments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'postId' })
    post: PostMySQLEntity;

} 