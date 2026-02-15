Cel aplikacji (MVP)

Aplikacja służy do zarządzania uczniami i ich płatnościami za lekcje online.

System ma:

1. Zarządzanie uczniami

Przechowywać listę uczniów:

imię

email

telefon

Możliwości:

dodawanie ucznia

usuwanie ucznia

wyświetlanie listy uczniów

2. Integracja z Google Calendar (następny etap)

pobierać wydarzenia z kalendarza

dopasowywać je do uczniów na podstawie tytułu eventu (imię ucznia)

zapisywać eventy w bazie

3. Widok ucznia (do zrobienia)

lista lekcji w wybranym miesiącu (domyślnie bieżący)

przy każdej lekcji:

status płatności: paid / unpaid

notatka

4. Widok "Do opłacenia" (do zrobienia)

lista lekcji ze statusem unpaid

Założenia techniczne

Jedna użytkowniczka systemu

Google Calendar jest źródłem prawdy dla terminów lekcji

Płatność przypisana jest do konkretnej lekcji (eventu)

Brak soft delete w MVP (usuwanie fizyczne)

Stack
Frontend

Angular 21

standalone

zoneless (bez zone.js)

routing włączony

SCSS

Backend

Node.js

Express

TypeScript

Modularna struktura (modules/students)

Baza

PostgreSQL (lokalnie)

ORM: Prisma 6

Środowisko

Postgres lokalny

Baza: tutoring

User: app

Password: app

DATABASE_URL=postgresql://app:app@localhost:5432/tutoring

Co jest gotowe
Backend

Express działa

GET /health

Prisma skonfigurowana

Migracja wykonana

Model Student

Endpointy:

GET /students

POST /students

DELETE /students/:id

Frontend

Angular działa

Routing skonfigurowany (standalone)

Następny krok

Włączyć CORS w backendzie

Podłączyć frontend do GET /students

Zbudować widok siatki uczniów

Dodać formularz dodawania ucznia
