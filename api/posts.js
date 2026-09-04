import {
    getPosts,
    createPost,
    deletePost
} from "../lib/db.js";

import { requireUser, requireAdmin } from "../lib/auth.js";

export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            const posts = await getPosts();

            return res.status(200).json({
                posts
            });
        }

        if (req.method === "POST") {
            const user = await requireUser(req, res);

            if (!user) {
                return;
            }

            const { title, content } = req.body || {};

            const cleanTitle = String(title || "").trim();
            const cleanContent = String(content || "").trim();

            if (!cleanTitle) {
                return res.status(400).json({
                    error: "제목을 입력해주세요."
                });
            }

            if (!cleanContent) {
                return res.status(400).json({
                    error: "내용을 입력해주세요."
                });
            }

            if (cleanTitle.length > 100) {
                return res.status(400).json({
                    error: "제목은 100자 이하로 작성해주세요."
                });
            }

            if (cleanContent.length > 10000) {
                return res.status(400).json({
                    error: "내용은 10,000자 이하로 작성해주세요."
                });
            }

            const post = await createPost({
                authorId: user.id,
                authorName: user.name,
                title: cleanTitle,
                content: cleanContent
            });

            return res.status(201).json({
                success: true,
                post
            });
        }

        if (req.method === "DELETE") {
            const admin = await requireAdmin(req, res);

            if (!admin) {
                return;
            }

            const id = String(req.query?.id || "").trim();

            if (!id) {
                return res.status(400).json({
                    error: "삭제할 게시글 ID가 없습니다."
                });
            }

            const deleted = await deletePost(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "게시글을 찾을 수 없습니다."
                });
            }

            return res.status(200).json({
                success: true
            });
        }

        return res.status(405).json({
            error: "허용되지 않는 요청입니다."
        });
    } catch (error) {
        console.error("POSTS ERROR:", error);

        return res.status(500).json({
            error: "게시판 처리 중 오류가 발생했습니다."
        });
    }
}
