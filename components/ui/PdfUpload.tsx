"use client";

import React, { useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

interface PdfUploadProps {
	onFileSelected: (file: File) => void;
}

export default function PdfUpload({ onFileSelected }: PdfUploadProps) {
	const [fileName, setFileName] = useState<string>("");
	const [aiResponse, setAiResponse] = useState<string>("");

	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.type === "application/pdf") {
			setFileName(file.name);
			setAiResponse(""); // Clear previous response
			onFileSelected(file);
		} else {
			setFileName("");
			if (file) alert("Please select a PDF file.");
		}
	};

	return (
		<Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
			<Box display="flex" alignItems="center" gap={2}>
				<input
					type="file"
					accept="application/pdf"
					style={{ display: "none" }}
					ref={inputRef}
					onChange={handleFileChange}
				/>
				<Button variant="contained" onClick={() => inputRef.current?.click()}>
					Upload PDF
				</Button>
			</Box>

			{fileName && (
				<Typography variant="body2" color="textSecondary">
					Selected file: {fileName}
				</Typography>
			)}

			{aiResponse && (
				<Box mt={2} maxWidth="800px">
					<Typography variant="h6">Response:</Typography>
					<Typography
						variant="body1"
						color="textPrimary"
						sx={{
							whiteSpace: "pre-wrap",
							backgroundColor: "#f5f5f5",
							padding: 2,
							borderRadius: 1,
							fontFamily: "monospace",
						}}
					>
						{aiResponse}
					</Typography>
				</Box>
			)}
		</Box>
	);
}
// 			if (wsRef.current && isConnected) {
// 				// Send file to WebSocket server
// 				const reader = new FileReader();
// 				reader.onload = () => {
// 					if (wsRef.current && reader.result) {
// 						wsRef.current.send(reader.result as ArrayBuffer);
// 					}
// 				};
// 				reader.readAsArrayBuffer(file);
// 			} else {
// 				setAiResponse(
// 					"WebSocket connection not available. Please refresh the page."
// 				);
// 			}
// 		} else {
// 			setFileName("");
// 			if (file) alert("Please select a PDF file.");
// 		}
// 	};

// 	return (
// 		<Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
// 			<Box display="flex" alignItems="center" gap={2}>
// 				<input
// 					type="file"
// 					accept="application/pdf"
// 					style={{ display: "none" }}
// 					ref={inputRef}
// 					onChange={handleFileChange}
// 				/>
// 				<Button variant="contained" onClick={() => inputRef.current?.click()}>
// 					Upload PDF
// 				</Button>
// 				<Typography
// 					variant="caption"
// 					color={isConnected ? "success.main" : "error.main"}
// 				>
// 					{isConnected ? "Connected" : "Disconnected"}
// 				</Typography>
// 			</Box>

// 			{fileName && (
// 				<Typography variant="body2" color="textSecondary">
// 					Selected file: {fileName}
// 				</Typography>
// 			)}

// 			{aiResponse && (
// 				<Box mt={2} maxWidth="800px">
// 					<Typography variant="h6">Response:</Typography>
// 					<Typography
// 						variant="body1"
// 						color="textPrimary"
// 						sx={{
// 							whiteSpace: "pre-wrap",
// 							backgroundColor: "#f5f5f5",
// 							padding: 2,
// 							borderRadius: 1,
// 							fontFamily: "monospace",
// 						}}
// 					>
// 						{aiResponse}
// 					</Typography>
// 				</Box>
// 			)}
// 		</Box>
// 	);
// }
