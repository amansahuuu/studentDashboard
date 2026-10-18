# Student Dashboard

A mobile-first React dashboard for students and parents to review school progress. It uses Firebase Authentication for sign-in and Cloud Firestore for student records, with a warm, responsive interface.

## Features

- **Student and parent views:** A child view focuses on homework and test results. Parent view includes student profile details, attendance, remarks, and attendance statistics.
- **Daily logs:** Browse daily logs by date using a calendar, with recorded class days highlighted.
- **Attendance insights:** See present/absent totals and an attendance breakdown chart.
- **Test results:** Review marks in a table and a performance trend chart.
- **Extra homework:** Shows homework assigned to the student's grade while its due date is current.
- **Responsive design:** A warm color palette and layouts designed for mobile and larger screens.

## Tech stack

- React 19 and Vite
- Firebase Authentication and Cloud Firestore
- Chart.js with `react-chartjs-2`
- `react-calendar`
- Oxlint

## Requirements

- Node.js and npm
- A Firebase project with Authentication and Cloud Firestore configured

## Run locally

```sh
npm install
npm run dev
```

Vite prints a local development URL in the terminal.

## Available commands

```sh
npm run dev      # Start the local development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
npm run lint     # Run Oxlint
```

## Firestore data layout

The app expects student-specific documents and subcollections:

```text
students/{studentId}
  marks/{markId}
  dailyLogs/{logId}
```

Student profile documents may include `name`, `grade`, `email`, and `subjects`. Mark documents use `testName`, `scoredMarks`, and `maxMarks`. Daily log document IDs are dates formatted as `DD-MM-YYYY`; documents may include `attendence`, `Remarks`, and a `homework` array.

Extra homework is loaded from the top-level collection:

```text
homeworks/{homeworkId}
```

Each homework document should include `title`, `content`, `gradesAssigned` (an array of student grades), and `dueDate` (a Firestore Timestamp).

## Firebase configuration and security

Configure the Firebase web app in `src/Firebase.js` for your own Firebase project. Review and deploy Firestore Security Rules that match your data and authorization requirements before using real student data.

The parent-view password prompt in the client is only a user-interface gate. It is not secure authorization: client-side code and hashes can be inspected or bypassed. Enforce all access control in Firestore Security Rules or a trusted backend. The current student data requests use the signed-in user's UID.
