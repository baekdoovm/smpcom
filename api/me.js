import { getCurrentUser } from "../lib/auth.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "허용되지 않는 요청입니다."
        });
    }

    try {
        const user = await getCurrentUser(req);

        if (!user) {
            return res.status(401).json({
                authenticated: false
            });
        }

        return res.status(200).json({
            authenticated: true,
            user: {
                id: user.id,
                name: user.name,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error("ME ERROR:", error);

        return res.status(500).json({
            error: "사용자 정보를 확인하는 중 오류가 발생했습니다."
        });
    }
}
