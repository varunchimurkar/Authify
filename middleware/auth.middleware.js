import jwt from "jsonwebtoken"

export const isLoggedIn = async (req, res, next) => {

    //token le ke aao
    //check token
    //get data from token

    try {
        console.log(req.cookies)
        let token = req.cookies?.token

        console.log("token found:", token ? "YES" : "NO")

        if (!token) {
            console.log("no token")
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        console.log("decoded data", decoded)

        req.user = decoded

        next()

    } catch (error) {
        console.log("Auth Middleware failure")
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }


}