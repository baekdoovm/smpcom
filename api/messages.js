import {
    getMessages,
    createMessage,
    deleteMessage
} from "../lib/db.js";

import { requireUser, requireAdmin } from "../lib/auth.js";

export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            const messages = await getMessages();

            return res.status(200).json({
                messages
            });
        }

        if (req.method === "POST") {
            const user = await requireUser(req, res);

            if (!user) {
                return;
            }

            const { content } = req.body || {};

            const cleanContent = String(content || "").trim();

            if (!cleanContent) {
                return res.status(400).json({
                    error: "메시지를 입력해주세요."
                });
            }

            if (cleanContent.length > 2000) {
                return res.status(400).json({
                    error: "메시지는 2,000자 이하로 작성해주세요."
                });
            }

            const message = await createMessage({
                authorId: user.id,
                authorName: user.name,
                content: cleanContent
            });

            return res.status(201).json({
                success: true,
                message
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
                    error: "삭제할 메시지 ID가 없습니다."
                });
            }

            const deleted = await deleteMessage(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "메시지를 찾을 수 없습니다."
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
        console.error("MESSAGES ERROR:", error);

        return res.status(500).json({
            error: "채팅 처리 중 오류가 발생했습니다."
        });
    }
}
