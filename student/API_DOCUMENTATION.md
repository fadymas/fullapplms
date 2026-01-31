# LMS Backend API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Users & Profiles](#users--profiles)
3. [Courses](#courses)
4. [Lectures & Content](#lectures--content)
5. [Quizzes](#quizzes)
6. [Payments & Wallet](#payments--wallet)
7. [Purchases](#purchases)
8. [Recharge Codes](#recharge-codes)
9. [Enrollments](#enrollments)
10. [Notifications](#notifications)
11. [Dashboard](#dashboard)
12. [Reports](#reports)

---

## Authentication

### POST /api/users/auth/register/

**Description:** Register a new student account

**Authentication:** No

**Allowed Roles:** Public

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+201234567890",
  "guardian_phone": "+201234567891",
  "grade": "Grade 10"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "email": "student@example.com",
  "role": "student",
  "is_active": true,
  "profile": {
    "full_name": "John Doe",
    "phone": "+201234567890",
    "guardian_phone": "+201234567891",
    "grade": "Grade 10"
  }
}
```

**Error Response (400):**
```json
{
  "email": ["A user with this email already exists."],
  "password": ["Password fields didn't match."]
}
```

---

### POST /api/users/auth/login/

**Description:** Login and receive JWT tokens

**Authentication:** No

**Allowed Roles:** Public

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "role": "student",
    "full_name": "John Doe"
  }
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid email or password."
}
```

---

### POST /api/users/auth/logout/

**Description:** Logout by blacklisting refresh token

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Request:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success Response (200):**
```json
{
  "detail": "Successfully logged out."
}
```

---

### POST /api/users/auth/refresh/

**Description:** Refresh access token

**Authentication:** No

**Allowed Roles:** Public

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Success Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Users & Profiles

### GET /api/users/profile/

**Description:** Get current user's complete profile

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Request:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "email": "student@example.com",
  "role": "student",
  "full_name": "John Doe",
  "phone": "+201234567890",
  "profile": {
    "type": "student",
    "full_name": "John Doe",
    "phone": "+201234567890",
    "guardian_phone": "+201234567891",
    "grade": "Grade 10"
  }
}
```

---

### PATCH /api/users/profile/

**Description:** Update current user's profile

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Request:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```
```json
{
  "full_name": "John Smith",
  "phone": "+201234567890",
  "grade": "Grade 11"
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "full_name": "John Smith",
    "phone": "+201234567890",
    "grade": "Grade 11"
  }
}
```

---

### GET /api/users/profiles/me/

**Description:** Get authenticated user's profile

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Success Response (200):** Same as GET /api/users/profile/

---

### GET /api/users/profiles/all/

**Description:** List all user profiles (role-based filtering)

**Authentication:** Yes

**Allowed Roles:** Admin, Teacher

**Permissions:**
- Admin: Can see all users
- Teacher: Can see students and other teachers
- Student: Forbidden (403)

**Success Response (200):**
```json
{
  "count": 50,
  "next": "http://api/users/profiles/all/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "email": "student@example.com",
      "role": "student",
      "full_name": "John Doe"
    }
  ]
}
```

---

### GET /api/users/students/all/

**Description:** List all student profiles

**Authentication:** Yes

**Allowed Roles:** Admin, Teacher, Student

**Permissions:**
- Admin/Teacher: See all student details
- Student: See limited student info

**Success Response (200):**
```json
{
  "count": 30,
  "results": [
    {
      "id": 1,
      "email": "student@example.com",
      "full_name": "John Doe",
      "grade": "Grade 10"
    }
  ]
}
```

---

### GET /api/users/teachers/all/

**Description:** List all teacher profiles

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Success Response (200):**
```json
{
  "count": 10,
  "results": [
    {
      "id": 5,
      "email": "teacher@example.com",
      "full_name": "Dr. Jane Smith",
      "specialization": "Mathematics"
    }
  ]
}
```

---

## Courses

### GET /api/courses/courses/

**Description:** List all active courses

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Query Parameters:**
- `search`: Search by title or description
- `category`: Filter by category
- `difficulty_level`: Filter by difficulty (beginner, intermediate, advanced)
- `instructor`: Filter by instructor ID
- `status`: Filter by status (draft, pending, approved, rejected)

**Success Response (200):**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "title": "Introduction to Python",
      "description": "Learn Python from scratch",
      "instructor": 5,
      "instructor_name": "Dr. Jane Smith",
      "status": "approved",
      "price": "299.99",
      "thumbnail": "/media/courses/python.jpg",
      "category": "Programming",
      "difficulty_level": "beginner",
      "student_count": 45,
      "created_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

---

### GET /api/courses/courses/{id}/

**Description:** Get course details

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Permissions:**
- Enrolled students: See full course content
- Non-enrolled students: See course info without lecture details
- Teachers/Admins: See full course content

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "description": "Learn Python from scratch",
  "instructor": 5,
  "instructor_name": "Dr. Jane Smith",
  "instructor_email": "teacher@example.com",
  "status": "approved",
  "price": "299.99",
  "price_locked": false,
  "thumbnail": "/media/courses/python.jpg",
  "category": "Programming",
  "difficulty_level": "beginner",
  "sections": [
    {
      "id": 1,
      "title": "Getting Started",
      "order": 1,
      "lectures": [
        {
          "id": 1,
          "title": "Introduction",
          "lecture_type": "video",
          "is_free": true,
          "duration_minutes": 15
        }
      ]
    }
  ],
  "student_count": 45,
  "is_enrolled": true,
  "is_purchased": true
}
```

---

### POST /api/courses/courses/

**Description:** Create a new course

**Authentication:** Yes

**Allowed Roles:** Teacher, Admin

**Request:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```
```json
{
  "title": "Advanced JavaScript",
  "description": "Master JavaScript ES6+",
  "price": "399.99",
  "category": "Programming",
  "difficulty_level": "advanced",
  "tags": ["javascript", "web development"]
}
```

**Success Response (201):**
```json
{
  "id": 2,
  "title": "Advanced JavaScript",
  "instructor": 5,
  "status": "draft",
  "price": "399.99"
}
```

**Error Response (403):**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

### PATCH /api/courses/courses/{id}/

**Description:** Update course details

**Authentication:** Yes

**Allowed Roles:** Course instructor, Admin

**Permissions:**
- Only course instructor or admin can update
- Cannot update if course is approved and price_locked is true

**Request:**
```json
{
  "title": "Advanced JavaScript - Updated",
  "price": "449.99"
}
```

**Success Response (200):** Updated course object

---

### POST /api/courses/courses/{id}/submit_for_approval/

**Description:** Submit course for admin approval

**Authentication:** Yes

**Allowed Roles:** Course instructor

**Success Response (200):**
```json
{
  "detail": "Course submitted for approval",
  "status": "pending"
}
```

---

### POST /api/courses/courses/{id}/approve/

**Description:** Approve a course

**Authentication:** Yes

**Allowed Roles:** Admin

**Success Response (200):**
```json
{
  "detail": "Course approved",
  "status": "approved"
}
```

---

### POST /api/courses/courses/{id}/reject/

**Description:** Reject a course

**Authentication:** Yes

**Allowed Roles:** Admin

**Request:**
```json
{
  "reason": "Content quality needs improvement"
}
```

**Success Response (200):**
```json
{
  "detail": "Course rejected",
  "status": "rejected"
}
```

---

### GET /api/courses/courses/{id}/content/

**Description:** Get course content (sections and lectures)

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Permissions:**
- Students must be enrolled to see lecture details
- Non-enrolled students see sections without lectures

**Success Response (200):**
```json
{
  "sections": [
    {
      "id": 1,
      "title": "Getting Started",
      "lectures": [...]
    }
  ]
}
```

---

## Lectures & Content

### GET /api/courses/lectures/

**Description:** List lectures

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Query Parameters:**
- `section`: Filter by section ID
- `course`: Filter by course ID

**Permissions:**
- Students can only see lectures from enrolled courses
- Teachers see lectures from their courses
- Admins see all lectures

---

### GET /api/courses/lectures/{id}/

**Description:** Get lecture details

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Permissions:**
- Students must be enrolled in the course
- Free lectures are accessible to all

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Introduction to Variables",
  "description": "Learn about variables in Python",
  "content": "Lecture content...",
  "video_url": "https://example.com/video.mp4",
  "lecture_type": "video",
  "is_free": false,
  "duration_minutes": 20,
  "files": [
    {
      "id": 1,
      "title": "Lecture Notes",
      "file": "/media/lectures/notes.pdf",
      "is_free": false
    }
  ]
}
```

**Error Response (403):**
```json
{
  "detail": "You must be enrolled in this course to access this lecture."
}
```

---

### POST /api/courses/lectures/

**Description:** Create a new lecture

**Authentication:** Yes

**Allowed Roles:** Course instructor, Admin

**Request:**
```json
{
  "section": 1,
  "title": "Variables and Data Types",
  "description": "Learn about Python variables",
  "content": "Lecture content here...",
  "video_url": "https://example.com/video.mp4",
  "lecture_type": "video",
  "is_free": false,
  "duration_minutes": 25,
  "order": 1
}
```

**Success Response (201):** Created lecture object

---

### GET /api/courses/files/{file_id}/download/

**Description:** Securely download lecture file

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Permissions:**
- Students must be enrolled in the course
- Free files are accessible to all

**Success Response (200):** File download

**Error Response (403):**
```json
{
  "detail": "You must be enrolled to download this file."
}
```

---

## Quizzes

### GET /api/quizzes/quizzes/

**Description:** List quizzes

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Query Parameters:**
- `lecture`: Filter by lecture ID
- `course`: Filter by course ID
- `status`: Filter by status (draft, published)

**Permissions:**
- Students see published quizzes from enrolled courses
- Teachers see quizzes from their courses
- Admins see all quizzes

---

### GET /api/quizzes/quizzes/{id}/

**Description:** Get quiz details

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Success Response (200) - Teacher/Admin:**
```json
{
  "id": 1,
  "lecture_id": 1,
  "title": "Python Basics Quiz",
  "description": "Test your knowledge",
  "time_limit_seconds": 1800,
  "max_attempts": 3,
  "randomize_questions": true,
  "is_mandatory": true,
  "status": "published",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "text": "What is a variable?",
      "points": "10.00",
      "options": [
        {"id": 1, "text": "A storage location"},
        {"id": 2, "text": "A function"}
      ]
    }
  ]
}
```

---

### POST /api/quizzes/quizzes/

**Description:** Create a new quiz

**Authentication:** Yes

**Allowed Roles:** Teacher, Admin

**Request:**
```json
{
  "lecture": 1,
  "title": "Python Basics Quiz",
  "description": "Test your knowledge",
  "time_limit_seconds": 1800,
  "max_attempts": 3,
  "is_mandatory": true
}
```

**Success Response (201):** Created quiz object

---

### POST /api/quizzes/quizzes/{id}/publish/

**Description:** Publish a quiz

**Authentication:** Yes

**Allowed Roles:** Quiz creator, Admin

**Success Response (200):**
```json
{
  "detail": "Quiz published successfully",
  "status": "published"
}
```

---

### POST /api/quizzes/quizzes/{id}/start_attempt/

**Description:** Start a new quiz attempt

**Authentication:** Yes

**Allowed Roles:** Student

**Permissions:**
- Student must be enrolled in the course
- Quiz must be published
- Must not exceed max_attempts

**Success Response (200):**
```json
{
  "id": 1,
  "quiz": 1,
  "started_at": "2026-01-23T14:00:00Z",
  "time_limit_seconds": 1800,
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "text": "What is a variable?",
      "options": [
        {"id": 1, "text": "A storage location"},
        {"id": 2, "text": "A function"}
      ]
    }
  ]
}
```

**Error Response (400):**
```json
{
  "detail": "Maximum attempts reached"
}
```

---

### POST /api/quizzes/attempts/{id}/submit_answer/

**Description:** Submit an answer for a question

**Authentication:** Yes

**Allowed Roles:** Student (attempt owner)

**Request:**
```json
{
  "question": 1,
  "answer_payload": {
    "selected_option": 1
  }
}
```

**Success Response (200):**
```json
{
  "detail": "Answer submitted",
  "question_id": 1
}
```

---

### POST /api/quizzes/attempts/{id}/submit/

**Description:** Submit the entire quiz attempt

**Authentication:** Yes

**Allowed Roles:** Student (attempt owner)

**Success Response (200):**
```json
{
  "detail": "Quiz submitted successfully",
  "score": "80.00",
  "status": "graded",
  "submitted_at": "2026-01-23T14:30:00Z"
}
```

---

### GET /api/quizzes/attempts/my_attempts/

**Description:** Get current student's quiz attempts

**Authentication:** Yes

**Allowed Roles:** Student

**Query Parameters:**
- `quiz`: Filter by quiz ID
- `lecture`: Filter by lecture ID
- `course`: Filter by course ID

**Success Response (200):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "quiz": 1,
      "started_at": "2026-01-23T14:00:00Z",
      "submitted_at": "2026-01-23T14:30:00Z",
      "status": "graded",
      "score": "80.00",
      "attempt_number": 1
    }
  ]
}
```

---

## Payments & Wallet

### GET /api/payments/wallets/my_wallet/

**Description:** Get current student's wallet

**Authentication:** Yes

**Allowed Roles:** Student

**Success Response (200):**
```json
{
  "id": 1,
  "student": 1,
  "student_email": "student@example.com",
  "student_name": "John Doe",
  "balance": "500.00",
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-01-23T14:00:00Z"
}
```

---

### POST /api/payments/wallets/{id}/manual_deposit/

**Description:** Manual deposit by admin

**Authentication:** Yes

**Allowed Roles:** Admin

**Request:**
```json
{
  "amount": "100.00",
  "reason": "Promotional credit"
}
```

**Success Response (200):**
```json
{
  "detail": "Deposit successful",
  "new_balance": "600.00",
  "transaction_id": 15
}
```

---

### GET /api/payments/transactions/

**Description:** List transactions

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Permissions:**
- Students see their own transactions
- Teachers see transactions related to their courses
- Admins see all transactions

**Query Parameters:**
- `transaction_type`: Filter by type (deposit, withdrawal, purchase, refund)
- `start_date`: Filter from date
- `end_date`: Filter to date

**Success Response (200):**
```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "wallet": 1,
      "student_email": "student@example.com",
      "transaction_type": "deposit",
      "transaction_type_display": "Deposit",
      "payment_method": "recharge_code",
      "amount": "100.00",
      "description": "Recharge code used",
      "created_at": "2026-01-23T10:00:00Z"
    }
  ]
}
```

---

## Purchases

### POST /api/payments/purchases/purchase_course/

**Description:** Purchase a course using wallet balance

**Authentication:** Yes

**Allowed Roles:** Student

**Request:**
```json
{
  "course_id": 1
}
```

**Success Response (200):**
```json
{
  "detail": "Course purchased successfully",
  "purchase_id": 5,
  "course_title": "Introduction to Python",
  "amount": "299.99",
  "new_balance": "200.01",
  "enrollment_created": true
}
```

**Error Response (400):**
```json
{
  "detail": "Insufficient wallet balance"
}
```

**Error Response (400):**
```json
{
  "detail": "Course already purchased"
}
```

---

### GET /api/payments/purchases/

**Description:** List purchases

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Permissions:**
- Students see their own purchases
- Teachers see purchases of their courses
- Admins see all purchases

**Success Response (200):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "student": 1,
      "student_email": "student@example.com",
      "course": 1,
      "course_title": "Introduction to Python",
      "course_instructor": "Dr. Jane Smith",
      "amount": "299.99",
      "price_at_purchase": "299.99",
      "purchased_at": "2026-01-20T10:00:00Z",
      "refunded": false
    }
  ]
}
```

---

### POST /api/payments/purchases/{id}/refund/

**Description:** Refund a purchase

**Authentication:** Yes

**Allowed Roles:** Admin

**Request:**
```json
{
  "reason": "Student request"
}
```

**Success Response (200):**
```json
{
  "detail": "Purchase refunded successfully",
  "refund_amount": "299.99",
  "new_balance": "499.99"
}
```

---

## Recharge Codes

### POST /api/payments/recharge-codes/use_code/

**Description:** Use a recharge code to add balance

**Authentication:** Yes

**Allowed Roles:** Student

**Request:**
```json
{
  "code": "RECHARGE-ABC123"
}
```

**Success Response (200):**
```json
{
  "detail": "Recharge code applied successfully",
  "amount": "100.00",
  "new_balance": "600.00"
}
```

**Error Response (400):**
```json
{
  "detail": "Recharge code is invalid or already used"
}
```

---

### POST /api/payments/recharge-codes/

**Description:** Create a recharge code

**Authentication:** Yes

**Allowed Roles:** Admin

**Request:**
```json
{
  "code": "RECHARGE-XYZ789",
  "amount": "100.00",
  "expires_at": "2026-12-31T23:59:59Z"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "code": "RECHARGE-XYZ789",
  "amount": "100.00",
  "is_used": false,
  "is_valid": true,
  "expires_at": "2026-12-31T23:59:59Z",
  "created_by": 5
}
```

---

### POST /api/payments/recharge-codes/bulk_generate/

**Description:** Generate multiple recharge codes

**Authentication:** Yes

**Allowed Roles:** Admin

**Request:**
```json
{
  "amount": "50.00",
  "count": 100,
  "prefix": "PROMO",
  "expires_at": "2026-12-31T23:59:59Z"
}
```

**Success Response (200):**
```json
{
  "detail": "100 recharge codes generated",
  "codes": ["PROMO-ABC123", "PROMO-DEF456", "..."]
}
```

---

### GET /api/payments/recharge-codes/

**Description:** List recharge codes

**Authentication:** Yes

**Allowed Roles:** Admin

**Query Parameters:**
- `is_used`: Filter by usage status
- `created_by`: Filter by creator

**Success Response (200):**
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "code": "RECHARGE-ABC123",
      "amount": "100.00",
      "is_used": true,
      "used_by_email": "student@example.com",
      "used_at": "2026-01-20T10:00:00Z",
      "created_by_email": "admin@example.com"
    }
  ]
}
```

---

## Enrollments

### GET /api/courses/enrollments/

**Description:** List enrollments

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Permissions:**
- Students see their own enrollments
- Teachers see enrollments in their courses
- Admins see all enrollments

**Success Response (200):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "student": 1,
      "student_email": "student@example.com",
      "course": 1,
      "course_title": "Introduction to Python",
      "enrolled_at": "2026-01-20T10:00:00Z",
      "progress_percentage": 45.5
    }
  ]
}
```

---

### POST /api/courses/enrollments/

**Description:** Create enrollment (automatic after purchase)

**Authentication:** Yes

**Allowed Roles:** Admin

**Note:** Enrollments are typically created automatically when a student purchases a course.

---

## Notifications

### GET /api/notifications/notifications/

**Description:** List notifications for current user

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Query Parameters:**
- `is_read`: Filter by read status (true/false)
- `is_important`: Filter important notifications
- `type`: Filter by notification type
- `search`: Search in title or message

**Success Response (200):**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "title": "Course Purchase Successful",
      "message": "You have successfully purchased Introduction to Python",
      "notification_type": "purchase",
      "is_read": false,
      "is_important": true,
      "created_at": "2026-01-23T10:00:00Z"
    }
  ]
}
```

---

### GET /api/notifications/notifications/unread_count/

**Description:** Get count of unread notifications

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Success Response (200):**
```json
{
  "unread_count": 5,
  "unread_important_count": 2
}
```

---

### POST /api/notifications/notifications/{id}/mark_as_read/

**Description:** Mark a notification as read

**Authentication:** Yes

**Allowed Roles:** Notification owner

**Success Response (200):**
```json
{
  "status": "marked as read"
}
```

---

### POST /api/notifications/notifications/mark_all_as_read/

**Description:** Mark all notifications as read

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Request (Optional):**
```json
{
  "notification_ids": [1, 2, 3]
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "marked_count": 5,
  "message": "Marked 5 notifications as read"
}
```

---

### DELETE /api/notifications/notifications/clear_all/

**Description:** Delete all read notifications

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Success Response (200):**
```json
{
  "status": "success",
  "deleted_count": 10,
  "message": "Deleted 10 read notifications"
}
```

---

## Dashboard

### GET /api/dashboard/

**Description:** Get dashboard statistics based on user role

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Query Parameters:**
- `period`: Predefined period (today, week, month, quarter, year)
- `start_date`: Custom start date (YYYY-MM-DD)
- `end_date`: Custom end date (YYYY-MM-DD)

**Success Response (200) - Admin:**
```json
{
  "overview": {
    "total_revenue": "50000.00",
    "total_students": 150,
    "total_courses": 25,
    "total_purchases": 300,
    "active_enrollments": 280
  },
  "today": {
    "revenue": "1500.00",
    "new_students": 5,
    "purchases": 12
  },
  "weekly_data": [...],
  "monthly_data": [...],
  "top_courses": [...],
  "recent_transactions": [...]
}
```

**Success Response (200) - Teacher:**
```json
{
  "overview": {
    "total_courses": 5,
    "total_students": 120,
    "total_revenue": "15000.00",
    "active_courses": 4
  },
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Python",
      "students": 45,
      "revenue": "13455.00"
    }
  ],
  "monthly_revenue": [...]
}
```

**Success Response (200) - Student:**
```json
{
  "overview": {
    "enrolled_courses": 3,
    "completed_courses": 1,
    "in_progress": 2,
    "total_spent": "899.97"
  },
  "wallet": {
    "balance": "200.00"
  },
  "recent_purchases": [...],
  "monthly_spending": [...]
}
```

---

### GET /api/dashboard/filter-options/

**Description:** Get available filter options for dashboard

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Success Response (200):**
```json
{
  "periods": ["today", "week", "month", "quarter", "year"],
  "courses": [...],
  "instructors": [...]
}
```

---

### GET /api/dashboard/export/

**Description:** Export dashboard data

**Authentication:** Yes

**Allowed Roles:** All authenticated users

**Query Parameters:**
- `format`: Export format (json, csv)
- `type`: Data type (overview, monthly, weekly)

**Success Response (200):** File download

---

## Reports

### GET /api/reports/top-courses/

**Description:** Get top courses by revenue/students

**Authentication:** Yes

**Allowed Roles:** Admin, Teacher

**Query Parameters:**
- `limit`: Number of courses (default: 10)
- `order_by`: Sort by (revenue, students)
- `start_date`: Filter from date
- `end_date`: Filter to date

**Success Response (200):**
```json
{
  "count": 10,
  "results": [
    {
      "course_id": 1,
      "course_title": "Introduction to Python",
      "instructor_name": "Dr. Jane Smith",
      "price": "299.99",
      "total_purchases": 45,
      "total_revenue": "13499.55",
      "active_students": 42
    }
  ]
}
```

---

### GET /api/reports/student-activity/

**Description:** Get student activity report

**Authentication:** Yes

**Allowed Roles:** Admin

**Query Parameters:**
- `start_date`: Filter from date
- `end_date`: Filter to date
- `min_purchases`: Minimum purchases filter

**Success Response (200):**
```json
{
  "count": 50,
  "results": [
    {
      "student_id": 1,
      "student_email": "student@example.com",
      "student_name": "John Doe",
      "wallet_balance": "200.00",
      "total_deposits": "1000.00",
      "total_purchases": 5,
      "total_spent": "1499.95",
      "total_refunds": "299.99",
      "net_spent": "1199.96",
      "last_activity": "2026-01-23T10:00:00Z"
    }
  ]
}
```

---

### GET /api/reports/instructor-revenue/

**Description:** Get instructor revenue report

**Authentication:** Yes

**Allowed Roles:** Admin, Teacher (own data only)

**Query Parameters:**
- `instructor`: Filter by instructor ID
- `start_date`: Filter from date
- `end_date`: Filter to date

**Success Response (200):**
```json
{
  "count": 5,
  "results": [
    {
      "instructor_id": 5,
      "instructor_email": "teacher@example.com",
      "instructor_name": "Dr. Jane Smith",
      "total_courses": 5,
      "total_purchases": 150,
      "total_revenue": "44999.50",
      "total_students": 120,
      "courses": [...]
    }
  ]
}
```

---

### GET /api/reports/recharge-codes/

**Description:** Get recharge code usage report

**Authentication:** Yes

**Allowed Roles:** Admin

**Success Response (200):**
```json
{
  "summary": {
    "total_codes": 500,
    "used_codes": 320,
    "unused_codes": 180,
    "total_value": "50000.00",
    "used_value": "32000.00"
  },
  "usage_by_creator": [...],
  "recent_usage": [...]
}
```

---

### GET /api/reports/refunds/

**Description:** Get refund report

**Authentication:** Yes

**Allowed Roles:** Admin

**Success Response (200):**
```json
{
  "summary": {
    "total_refunds": 15,
    "total_amount": "4499.85",
    "refund_rate": "5.0"
  },
  "by_course": [...],
  "by_student": [...],
  "recent_refunds": [...]
}
```

---

### GET /api/reports/failed-transactions/

**Description:** Get failed transactions report

**Authentication:** Yes

**Allowed Roles:** Admin

**Success Response (200):**
```json
{
  "summary": {
    "total_failed": 25,
    "total_amount": "7499.75"
  },
  "by_ip": [...],
  "recent_failed": [...]
}
```

---

### GET /api/reports/export/

**Description:** Export reports in various formats

**Authentication:** Yes

**Allowed Roles:** Admin

**Query Parameters:**
- `report_type`: Type of report (top_courses, student_activity, etc.)
- `format`: Export format (json, csv, pdf)
- `start_date`: Filter from date
- `end_date`: Filter to date

**Success Response (200):** File download

---

## Permission Notes

### Role-Based Access

**Student:**
- Can view their own profile, wallet, transactions, purchases, enrollments
- Can view published courses and enrolled course content
- Can purchase courses, use recharge codes
- Can take quizzes in enrolled courses
- Can view their own notifications

**Teacher:**
- All student permissions
- Can create and manage their own courses
- Can view students enrolled in their courses
- Can create and manage quizzes for their courses
- Can view revenue from their courses

**Admin:**
- Full access to all endpoints
- Can manage all users, courses, transactions
- Can generate recharge codes
- Can refund purchases
- Can view all reports and analytics
- Can approve/reject courses

### Authentication

All endpoints except registration and login require authentication via JWT Bearer token:

```http
Authorization: Bearer <access_token>
```

### Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found:**
```json
{
  "detail": "Not found."
}
```

**500 Internal Server Error:**
```json
{
  "detail": "An error occurred. Please try again later."
}
```

---

## Base URL

Production: `https://api.example.com`
Development: `http://localhost:8000`

## Rate Limiting

Rate limits may apply to certain endpoints. Contact the administrator for details.

## Support

For API support, contact: support@example.com
