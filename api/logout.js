import { clearSessionCookie } from "../lib/auth.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "허용되지 않는 요청입니다."
        });
    }

    try {
        clearSessionCookie(res);

        return res.status(200).json({
            success: true
        });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);

        return res.status(500).json({
            error: "로그아웃 처리 중 오류가 발생했습니다."
        });
    }
}
