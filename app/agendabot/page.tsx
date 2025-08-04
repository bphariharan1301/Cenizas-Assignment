"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	Box,
	Typography,
	TextField,
	IconButton,
	Button,
	List,
	ListItem,
	ListItemText,
	CircularProgress,
	Paper,
	Divider,
	ListItemButton,
} from "@mui/material";
import {
	Send as SendIcon,
	Add as AddIcon,
	Google as GoogleIcon,
	Event as CalendarIcon,
} from "@mui/icons-material";

interface Message {
	role: "user" | "assistant";
	text: string;
	created_at?: string;
}

interface ChatSession {
	id: string;
	title: string;
	created_at: string;
}

interface User {
	email: string;
	name: string;
}

export default function AgendaBotPage() {
	const [user, setUser] = useState<User | null>(null);
	const [sessions, setSessions] = useState<ChatSession[]>([]);
	const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Check authentication status
	useEffect(() => {
		checkAuth();
		loadSessions();
	}, []);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const checkAuth = async () => {
		try {
			const res = await fetch("https://localhost:8000/api/document/session", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("access_token")}`,
				},
			});
			const data = await res.json();
			if (data.authed) {
				setUser(data.user);
			}
		} catch (error) {
			console.error("Auth check failed:", error);
		}
	};

	const handleGoogleAuth = async () => {
		try {
			const authUrl = "https://localhost:8000/api/document/auth/google";
			window.location.href = authUrl;
		} catch (error) {
			console.error("Google auth failed:", error);
		}
	};

	const loadSessions = async () => {
		try {
			const res = await fetch("https://localhost:8000/api/document/sessions", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("access_token")}`,
				},
			});
			if (res.ok) {
				const data = await res.json();
				setSessions(data);
			}
		} catch (error) {
			console.error("Failed to load sessions:", error);
		}
	};

	const createNewSession = async () => {
		try {
			const res = await fetch(
				"https://localhost:8000/api/document/sessions/create",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("access_token")}`,
					},
					credentials: "include",
					body: JSON.stringify({ title: "New Chat" }),
				}
			);
			if (res.ok) {
				const newSession = await res.json();
				setSessions([newSession, ...sessions]);
				setCurrentSessionId(newSession.id);
				setMessages([]);
			}
		} catch (error) {
			console.error("Failed to create session:", error);
		}
	};

	const loadMessages = async (sessionId: string) => {
		try {
			const res = await fetch(
				`https://localhost:8000/api/document/sessions/${sessionId}/messages`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("access_token")}`,
					},
				}
			);
			if (res.ok) {
				const data = await res.json();
				setMessages(data);
			}
		} catch (error) {
			console.error("Failed to load messages:", error);
		}
	};

	const handleSendMessage = async () => {
		if (!input.trim() || !currentSessionId || loading) return;

		const userMessage: Message = { role: "user", text: input.trim() };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setLoading(true);

		try {
			const res = await fetch("https://localhost:8000/api/document/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("access_token")}`,
				},
				credentials: "include",
				body: JSON.stringify({
					messages: [...messages, userMessage],
					sessionId: currentSessionId,
				}),
			});

			if (res.status === 401) {
				setUser(null);
				alert("Session expired. Please log in again.");
				window.location.href = "/home?agendaBotTab=true";
				setLoading(false);
				return;
			}

			if (!res.body) {
				setMessages((prev) => [
					...prev,
					{ role: "assistant", text: "Sorry, no response from server." },
				]);
				setLoading(false);
				return;
			}

			let aiMessage = "";
			let done = false;
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			// Add a placeholder assistant message for streaming
			setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

			while (!done) {
				const { value, done: doneReading } = await reader.read();
				done = doneReading;
				buffer += value ? decoder.decode(value, { stream: true }) : "";

				let lines = buffer.split("\n");
				buffer = lines.pop() || "";
				for (let line of lines) {
					if (!line.trim().startsWith("data:")) continue;
					const dataStr = line.replace("data:", "").trim();
					if (dataStr === "[DONE]") {
						done = true;
						break;
					}
					try {
						const data = JSON.parse(dataStr);
						if (data.type === "message" && data.content) {
							aiMessage += data.content;
							setMessages((prev) => {
								// Update the last assistant message
								const updated = [...prev];
								const lastIdx = updated.length - 1;
								if (updated[lastIdx]?.role === "assistant") {
									updated[lastIdx] = {
										...updated[lastIdx],
										text: aiMessage,
									};
								}
								return updated;
							});
						}
						if (data.type === "error") {
							setMessages((prev) => [
								...prev,
								{ role: "assistant", text: data.content },
							]);
							done = true;
							break;
						}
					} catch (e) {
						// Ignore JSON parse errors for incomplete chunks
					}
				}
			}
		} catch (error: any) {
			console.error("Chat failed:", error);
			if (error.code === "token_not_valid") {
				setUser(null);
				alert("Session expired. Please log in again.");
				window.location.href = "/home?agendaBotTab=true";
			}
			setMessages((prev) => [
				...prev,
				{ role: "assistant", text: "Sorry, something went wrong." },
			]);
		}
		setLoading(false);
	};

	const loadCalendarEvents = async () => {
		try {
			const res = await fetch(
				"https://localhost:8000/api/document/calendar/today",
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("access_token")}`,
						googleToken: localStorage.getItem("google_access_token") || "",
					},
				}
			);
			if (res.ok) {
				const events = await res.json();
				console.log("Events:", events);
				setCalendarEvents(events);
				// Also send calendar info to chat
				if (currentSessionId) {
					const calendarSummary = events
						.map(
							(e: any) =>
								`${e.summary} at ${new Date(
									e.start?.dateTime || e.start?.date
								).toLocaleTimeString()}`
						)
						.join(", ");
					const contextMessage = `Here are today's calendar events: ${calendarSummary}`;
					setMessages((prev) => [
						...prev,
						{ role: "assistant", text: contextMessage },
					]);
				}
			}
		} catch (error) {
			console.error("Failed to load calendar:", error);
		}
	};

	const selectSession = (sessionId: string) => {
		setCurrentSessionId(sessionId);
		loadMessages(sessionId);
	};

	if (!user) {
		return (
			<Box
				sx={{
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexDirection: "column",
					gap: 3,
				}}
			>
				<Typography variant="h4" gutterBottom>
					AgendaBot AI Assistant
				</Typography>
				<Typography variant="body1" color="text.secondary" textAlign="center">
					Connect your Google account to start chatting with your calendar
				</Typography>
				<Button
					variant="contained"
					startIcon={<GoogleIcon />}
					onClick={handleGoogleAuth}
					size="large"
				>
					Sign in with Google
				</Button>
			</Box>
		);
	}

	return (
		<Box sx={{ height: "100vh", display: "flex" }}>
			{/* Sidebar */}
			<Box
				sx={{
					width: 280,
					borderRight: "1px solid #e0e0e0",
					bgcolor: "#f5f5f5",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Box sx={{ p: 2 }}>
					<Button
						fullWidth
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={createNewSession}
					>
						New Chat
					</Button>
				</Box>
				<Divider />
				<List sx={{ flex: 1, overflow: "auto" }}>
					{sessions.map((session) => (
						<ListItemButton
							key={session.id}
							component="button"
							selected={currentSessionId === session.id}
							onClick={() => selectSession(session.id)}
							sx={{
								textAlign: "left",
								width: "100%",
								border: "none",
								background: "none",
								p: 0,
							}}
						>
							<ListItemText
								primary={session.title}
								secondary={new Date(session.created_at).toLocaleDateString()}
							/>
						</ListItemButton>
					))}
				</List>
				<Box sx={{ p: 2 }}>
					<Button
						fullWidth
						variant="outlined"
						startIcon={<CalendarIcon />}
						onClick={loadCalendarEvents}
					>
						Load Calendar
					</Button>
				</Box>
			</Box>

			{/* Main Chat Area */}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				{/* Header */}
				<Box
					sx={{
						p: 2,
						borderBottom: "1px solid #e0e0e0",
						bgcolor: "white",
					}}
				>
					<Typography variant="h6">
						Welcome, {user.name || user.email}
					</Typography>
				</Box>

				{/* Messages */}
				<Box
					sx={{
						flex: 1,
						overflow: "auto",
						p: 2,
						bgcolor: "#fafafa",
					}}
				>
					{messages.map((msg, idx) => (
						<Box key={idx} sx={{ mb: 2 }}>
							<Typography
								variant="caption"
								sx={{
									color: "#666",
									textTransform: "uppercase",
									fontSize: "11px",
									fontWeight: 600,
								}}
							>
								{msg.role === "user" ? "You" : "Assistant"}
							</Typography>
							<Paper
								sx={{
									p: 2,
									mt: 0.5,
									bgcolor: msg.role === "user" ? "#e3f2fd" : "white",
								}}
							>
								<Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
									{msg.text}
								</Typography>
							</Paper>
						</Box>
					))}
					{loading && (
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<CircularProgress size={16} />
							<Typography variant="body2" color="text.secondary">
								Assistant is thinking...
							</Typography>
						</Box>
					)}
					<div ref={messagesEndRef} />
				</Box>

				{/* Input */}
				<Box
					sx={{
						p: 2,
						borderTop: "1px solid #e0e0e0",
						bgcolor: "white",
					}}
				>
					<Box sx={{ display: "flex", gap: 1 }}>
						<TextField
							fullWidth
							placeholder="Ask about your calendar or anything else..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSendMessage();
								}
							}}
							disabled={loading || !currentSessionId}
							multiline
							maxRows={3}
						/>
						<IconButton
							onClick={handleSendMessage}
							disabled={loading || !input.trim() || !currentSessionId}
							color="primary"
						>
							<SendIcon />
						</IconButton>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
