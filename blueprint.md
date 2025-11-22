
# Project Blueprint

## Overview

This document outlines the plan and implementation details for the web application, a student progress dashboard. The application is designed for parents to monitor their child's one-on-one tuition attendance, listen rate, and repetition progress. It provides a clear overview of past sessions, upcoming classes, and pending learning activities.

## Implemented Features

*   **Header:** A card-like header that displays the dashboard title, a brief description, and the student's ID with a modern, clean design.
*   **Summary Cards:** Shows key metrics with icons, shadows, and hover effects.
*   **Session History Card:** A unified card with a styled header. It contains the period filter, view-switcher, and the detailed session history table or calendar view.
*   **Upcoming Classes Card:** A unified card with a left-aligned header containing the title and subtitle.
*   **Table Row Hover Effect:** Table rows in both the session history and upcoming classes tables highlight on hover.
*   **Seamless Table Integration:** Tables sit flush within their parent cards, with no extra spacing.
*   **Styled Table Headers:** Table headers have a distinct light gray background and dark text for readability.
*   **Prioritized Table Data:** High-priority data in tables (like Subject and Listen Rate) is bolded to stand out from secondary information.
*   **Calendar View:** A compact monthly calendar of the session history, with days color-coded by listen rate for clear visibility.
*   **Filter by Period:** A dropdown to filter the session history by various time periods.
*   **Responsive Design:** The application is fully responsive and adapts to different screen sizes for an optimal experience on mobile, tablet, and PC.

## Data Points

*   **Session History:** Date, Start Time, End Time, Listen Rate, Subject, Teacher ID.
*   **Upcoming Classes:** Date, Start Time, End Time, Subject, Teacher, Room, Session ID.
*   **Repetition Plan:** Data on pending repetitions, including due dates.

## Current Plan: Update Mobile KPI Card Layout

1.  **Goal:** Change the layout of the KPI summary cards on mobile from a single-column list to a two-column grid.
2.  **CSS Changes (`style.css`):**
    *   In the `@media (max-width: 768px)` media query, modify the `.summary-cards` rule.
    *   Change the `grid-template-columns` property from `1fr` to `repeat(2, 1fr)` to create a two-column grid.
