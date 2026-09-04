import {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement
} from "../lib/db.js";

import { requireAdmin } from "../lib/auth.js";

export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            const announcements = await getAnnouncements();

            return res.status(200).json({
                announcements
            });
        }

        if (req.method === "POST") {
            const admin = await requireAdmin(req, res);

            if (!admin) {
                return;
            }

            const { title, content } = req.body || {};

            const cleanTitle = String(title || "").trim();
            const cleanContent = String(content || "").trim();

            if (!cleanTitle) {
                return res.status(400).json({
                    error: "공지 제목을 입력해주세요."
                });
            }

            if (!cleanContent) {
                return res.status(400).json({
                    error: "공지 내용을 입력해주세요."
                });
            }

            if (cleanTitle.length > 100) {
                return res.status(400).json({
                    error: "공지 제목은 100자 이하로 작성해주세요."
                });
            }

            if (cleanContent.length > 10000) {
                return res.status(400).json({
                    error: "공지 내용은 10,000자 이하로 작성해주세요."
                });
            }

            const announcement = await createAnnouncement({
                authorId: admin.id,
                authorName: admin.name,
                title: cleanTitle,
                content: cleanContent
            });

            return res.status(201).json({
                success: true,
                announcement
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
                    error: "삭제할 공지 ID가 없습니다."
                });
            }

            const deleted = await deleteAnnouncement(id);

            if (!deleted) {
                return res.status(404).json({
                    error: "공지를 찾을 수 없습니다."
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
        console.error("ANNOUNCEMENTS ERROR:", error);

        return res.status(500).json({
            error: "공지사항 처리 중 오류가 발생했습니다."
        });
    }
}
