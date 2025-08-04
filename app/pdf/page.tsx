"use client";

import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";

import PdfUpload from "../../components/ui/PdfUpload";
import { TextField, IconButton, CircularProgress } from "@mui/material";
import { Send as SendIcon, AttachFile as FileIcon } from "@mui/icons-material";

export default function PdfChatPage() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [chat, setChat] = useState<{ role: "user" | "ai"; message: string }[]>(
		[]
	);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [pdfUploaded, setPdfUploaded] = useState(false);
	const [aiBuffer, setAiBuffer] = useState(""); // For streaming AI response
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Store the uploaded PDF id or token if needed
	const [pdfId, setPdfId] = useState<string | null>(null);

	useEffect(() => {
		if (selectedFile) {
			uploadPdf(selectedFile);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFile]);

	const uploadPdf = async (file: File) => {
		setLoading(true);
		setPdfUploaded(false);
		setPdfId(null);
		setChat([]);
		setAiBuffer("");
		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch(
				"https://localhost:8000/api/document/upload_pdf/",
				{
					method: "POST",
					body: formData,
				}
			);
			if (!res.ok) throw new Error("Failed to upload PDF");
			const data = await res.json();
			setPdfUploaded(true);
			setPdfId(data.id || null);
			setChat([
				{
					role: "ai",
					message:
						"PDF uploaded and processed. You can now ask questions about your document.",
				},
			]);
		} catch (e: any) {
			setChat([
				{
					role: "ai",
					message: "Error uploading PDF: " + (e?.message || e),
				},
			]);
		}
		setLoading(false);
	};

	const handleSend = async () => {
		if (!input.trim() || !pdfUploaded || !pdfId) return;

		const userMessage = input.trim();
		setChat((prev) => [...prev, { role: "user", message: userMessage }]);
		setInput("");
		setLoading(true);
		setAiBuffer("");

		try {
			const response = await fetch("https://localhost:8000/api/document/ask/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					pdf_id: pdfId,
					question: userMessage,
				}),
			});

			if (!response.ok || !response.body) {
				throw new Error("Failed to get AI response");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");
			let done = false;
			let fullMessage = "";

			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				const chunk = decoder.decode(value || new Uint8Array(), {
					stream: !done,
				});

				// Split on newlines and process SSE lines
				const lines = chunk.split("\n");
				for (let line of lines) {
					line = line.trim();
					if (!line) continue;
					if (line === "data: [DONE]") {
						done = true;
						break;
					}
					if (line.startsWith("data: ")) {
						try {
							const parsed = JSON.parse(line.slice(6));
							if (parsed.type === "message" && parsed.content) {
								fullMessage += parsed.content;
								setAiBuffer((prev) => prev + parsed.content);
							}
						} catch {
							// Ignore JSON parse errors from partial chunks
						}
					}
				}
			}

			// Finalize chat after streaming ends
			setChat((prev) => [...prev, { role: "ai", message: fullMessage }]);
			setAiBuffer("");
		} catch (e: any) {
			setChat((prev) => [
				...prev,
				{ role: "ai", message: "Error: " + (e?.message || e) },
			]);
			setAiBuffer("");
		}
		setLoading(false);
	};

	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				bgcolor: "#f7f7f8",
				fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
			}}
		>
			{!selectedFile ? (
				<Box
					sx={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "column",
						gap: 3,
					}}
				>
					<FileIcon sx={{ fontSize: 48, color: "#8e8ea0" }} />
					<Typography variant="h6" color="#202123" textAlign="center">
						Upload a PDF to start chatting
					</Typography>
					<Typography
						variant="body2"
						color="#8e8ea0"
						textAlign="center"
						maxWidth="400px"
					>
						Upload your PDF document and ask questions about its content
					</Typography>
					<PdfUpload onFileSelected={setSelectedFile} />
				</Box>
			) : (
				<>
					{/* File Info Bar */}
					<Box
						sx={{
							borderBottom: "1px solid #e5e5e5",
							bgcolor: "white",
							px: 4,
							py: 2,
							display: "flex",
							alignItems: "center",
							gap: 2,
						}}
					>
						<Typography
							variant="body2"
							color="#8e8ea0"
							sx={{ fontSize: "14px" }}
						>
							{selectedFile.name}
						</Typography>
					</Box>

					{/* Messages Area */}
					<Box
						sx={{
							flex: 1,
							overflow: "auto",
							px: 4,
							py: 3,
						}}
					>
						{chat.map((msg, idx) => (
							<Box key={idx} sx={{ mb: 6 }}>
								<Typography
									variant="body2"
									sx={{
										color: "#8e8ea0",
										mb: 1,
										fontSize: "12px",
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}
								>
									{msg.role === "user" ? "You" : "Assistant"}
								</Typography>
								<Typography
									variant="body1"
									sx={{
										color: "#202123",
										lineHeight: 1.6,
										fontSize: "16px",
										whiteSpace: "pre-wrap",
									}}
								>
									{msg.message}
								</Typography>
							</Box>
						))}

						{/* Streaming response */}
						{aiBuffer && (
							<Box sx={{ mb: 6 }}>
								<Typography
									variant="body2"
									sx={{
										color: "#8e8ea0",
										mb: 1,
										fontSize: "12px",
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}
								>
									Assistant
								</Typography>
								<Typography
									variant="body1"
									sx={{
										color: "#202123",
										lineHeight: 1.6,
										fontSize: "16px",
										whiteSpace: "pre-wrap",
									}}
								>
									{aiBuffer}
								</Typography>
							</Box>
						)}

						{loading && !aiBuffer && (
							<Box sx={{ mb: 6 }}>
								<Typography
									variant="body2"
									sx={{
										color: "#8e8ea0",
										mb: 1,
										fontSize: "12px",
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}
								>
									Assistant
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
									<CircularProgress size={16} sx={{ color: "#8e8ea0" }} />
									<Typography variant="body1" color="#8e8ea0">
										Thinking...
									</Typography>
								</Box>
							</Box>
						)}

						<div ref={messagesEndRef} />
					</Box>

					{/* Input Area */}
					<Box
						sx={{
							borderTop: "1px solid #e5e5e5",
							bgcolor: "white",
							px: 4,
							py: 3,
						}}
					>
						<Box
							sx={{
								display: "flex",
								gap: 2,
								alignItems: "flex-end",
								maxWidth: "800px",
								mx: "auto",
							}}
						>
							<TextField
								fullWidth
								multiline
								maxRows={4}
								placeholder="Message PDF Chat Assistant..."
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (
										e.key === "Enter" &&
										!e.shiftKey &&
										!loading &&
										pdfUploaded
									) {
										e.preventDefault();
										handleSend();
									}
								}}
								disabled={loading || !pdfUploaded}
								variant="outlined"
								sx={{
									"& .MuiOutlinedInput-root": {
										borderRadius: "12px",
										bgcolor: "#f7f7f8",
										border: "1px solid #e5e5e5",
										"&:hover": {
											borderColor: "#d0d0d0",
										},
										"&.Mui-focused": {
											borderColor: "#10a37f",
											boxShadow: "0 0 0 1px #10a37f",
										},
										"& fieldset": {
											border: "none",
										},
									},
									"& .MuiInputBase-input": {
										fontSize: "16px",
										py: 1.5,
									},
								}}
							/>
							<IconButton
								onClick={handleSend}
								disabled={loading || !input.trim() || !pdfUploaded}
								sx={{
									width: 40,
									height: 40,
									bgcolor:
										input.trim() && pdfUploaded && !loading
											? "#10a37f"
											: "#e5e5e5",
									color:
										input.trim() && pdfUploaded && !loading
											? "white"
											: "#8e8ea0",
									"&:hover": {
										bgcolor:
											input.trim() && pdfUploaded && !loading
												? "#0d8f73"
												: "#e5e5e5",
									},
									"&.Mui-disabled": {
										bgcolor: "#e5e5e5",
										color: "#8e8ea0",
									},
									borderRadius: "8px",
								}}
							>
								<SendIcon sx={{ fontSize: 18 }} />
							</IconButton>
						</Box>
					</Box>
				</>
			)}
		</Box>
	);
}
