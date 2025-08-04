"use client";

import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const googleAccessToken = searchParams.get("google_access_token") || "";
	const error = searchParams.get("error");

	// const

	useEffect(() => {
		console.log("Token:", token);
		console.log("Token type:", typeof token);
		if (typeof token === "string") {
			// Store token securely (httpOnly cookie recommended)
			localStorage.setItem("access_token", token);
			localStorage.setItem("google_access_token", googleAccessToken);
			localStorage.setItem("isAuthenticated", "true");
			// localStorage.setItem("userDetails", JSON.stringify())
			router.push("/home?agendaBotTab=true"); // Redirect to protected page
		}

		if (error) {
			console.error("OAuth Error:", error);
			router.push("/login");
		}
	}, [token, error, router]);

	return (
		<Box
			sx={{
				height: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				gap: 2,
			}}
		>
			<CircularProgress />
			<Typography variant="h6">Processing authentication...</Typography>
			<Typography variant="body2" color="text.secondary">
				You will be redirected shortly.
			</Typography>
		</Box>
	);
}
