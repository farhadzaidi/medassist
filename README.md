MedAssist is a web application that I built over the course of HackPrinceton during Spring 2025.
This application was submitted as part of the Healthcare + Patient Safety track.
Note: Due to the time constraints of the hackathon (I spent roughly 20 hours planning and coding) and my working on this solo, the application is largely an MVP and is not production ready.

## Inspiration

Patient safety is a critical issue, especially during the transitional phases of care—before and after a doctor's visit. Many patients face confusion when interpreting medical documents, understanding discharge instructions, or identifying potential medication interactions. Language barriers further amplify these challenges, leaving patients vulnerable to misinformation and mismanagement of their health. MedAssist was created to empower patients, reduce confusion, and make it easier for them to take control of their health—no matter their background or language proficiency.

## What it does

MedAssist offers three core services:

1. **SOAP Notes Generator**: Helps users prepare for a doctor’s visit by generating clear and structured SOAP (Subjective, Objective, Assessment, Plan) notes. This is especially helpful for users with language barriers who may struggle to communicate their symptoms effectively.

2. **Document Analyzer**: Users can upload hospital documents as PDFs or images. The app uses OCR and AI to summarize the content, extract key details, and provide actionable tips—making it easier to understand discharge instructions and other medical paperwork.

3. **Medication Interaction Checker**: Allows users to input their medications and get alerts about potential interactions. This simplifies complex and often unclear discharge instructions to promote safer self-care.

## How we built it

- **Backend**: Built using Python and Flask. We used Tesseract OCR to extract text from uploaded documents and Google's Gemini AI for generating summaries and insights.
- **Frontend**: Developed with React and TypeScript to create a responsive, clean, and user-friendly interface.
- **Multilingual Support**: Integrated translation features to aid users facing language barriers.

## Challenges we ran into

- **Medication Interaction Checker**: Finding accurate and reliable data for drug interaction analysis was a major hurdle. Due to time constraints, this feature wasn't fully implemented, but we plan to integrate open APIs like RxNav and OpenFDA in future iterations.

## Accomplishments that we're proud of

- A clean, intuitive, and accessible UI.
- Multilingual support to help non-English speakers.
- Successfully integrating multiple AI technologies (e.g., Gemini, Tesseract OCR) to deliver meaningful and helpful results for patients.

## What we learned

- How to leverage AI tools like Gemini and OCR libraries to process and simplify complex healthcare information.
- The importance of user-centric design, especially in healthcare where clarity and usability are essential.
- Strategies for building multilingual, accessible applications to better serve diverse populations.

## What's next for MedAssist

- Fully integrating medication interaction APIs to complete the checker functionality.
- Expanding core services to include appointment reminders, personalized care suggestions, and symptom tracking.
- Replacing the temporary SQLite setup with a robust database solution for better scalability and reliability.