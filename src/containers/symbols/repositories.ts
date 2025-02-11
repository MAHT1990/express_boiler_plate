/* REPOSITORIES */
import { PostMySQLRepository } from "../../data/repositories/Post.repository.mysql";
import { CommentMySQLRepository } from "../../data/repositories/Comment.repository.mysql";


/**
 * Symbols for Repositories
 */
export const REPOSITORIES = {
    PostMySQLRepository: Symbol.for("PostMySQLRepository"),
    CommentMySQLRepository: Symbol.for("CommentMySQLRepository"),
}

