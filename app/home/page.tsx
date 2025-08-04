"use client";

import React, { useEffect, useState } from "react";
import {
	Box,
	AppBar,
	Toolbar,
	Typography,
	Button,
	Tab,
	Tabs,
} from "@mui/material";
import {
	PictureAsPdf as PdfIcon,
	CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import PdfChatPage from "../pdf/page";
import AgendaBotPage from "../agendabot/page";
import { useSearchParams } from "next/navigation";

export default function HomePage() {
	const [currentTab, setCurrentTab] = useState(0);

	const searchParams = useSearchParams();

	useEffect(() => {
		if (searchParams.get("agendaBotTab") === "true") {
			setCurrentTab(1);
		}
	});

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setCurrentTab(newValue);
	};

	return (
		<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
			{/* Navigation Header */}
			<AppBar position="static" elevation={1}>
				<Toolbar>
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						AI Assistant Platform
					</Typography>
					<Tabs
						value={currentTab}
						onChange={handleTabChange}
						textColor="inherit"
						indicatorColor="secondary"
					>
						<Tab
							icon={<PdfIcon />}
							label="PDF Chat"
							iconPosition="start"
							sx={{ color: "white" }}
						/>
						<Tab
							icon={<CalendarIcon />}
							label="AgendaBot"
							iconPosition="start"
							sx={{ color: "white" }}
						/>
					</Tabs>
				</Toolbar>
			</AppBar>

			{/* Main Content */}
			<Box sx={{ flex: 1 }}>
				{currentTab === 0 && <PdfChatPage />}
				{currentTab === 1 && <AgendaBotPage />}
			</Box>
		</Box>
	);
}
