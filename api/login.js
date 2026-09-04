import { getUserByName, verifyAccessCode } from "../lib/db.js";
import { createSession, setSessionCookie } from "../lib/auth.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "허용되지 않는 요청입니다."
        });
    }

    try {
        const { name, code } = req.body || {};

        if (!name || !code) {
            return res.status(400).json({
                error: "이름과 접속 코드를 입력해주세요."
            });
        }

        const cleanName = String(name).trim();
        const cleanCode = String(code).trim();

        if (!cleanName || !cleanCode) {
            return res.status(400).json({
                error: "이름과 접속 코드를 입력해주세요."
            });
        }

        const user = await getUserByName(cleanName);

        if (!user) {
            return res.status(401).json({
                error: "이름 또는 접속 코드가 올바르지 않습니다."
            });
        }

        const valid = await verifyAccessCode(
            cleanCode,
            user.access_code_hash
        );

        if (!valid) {
            return res.status(401).json({
                error: "이름 또는 접속 코드가 올바르지 않습니다."
            });
        }

        const token = await createSession({
            id: user.id,
            name: user.name,
            isAdmin: user.is_admin
        });

        setSessionCookie(res, token);

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                isAdmin: user.is_admin
            }
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            error: "로그인 처리 중 오류가 발생했습니다."
        });
    }
}
