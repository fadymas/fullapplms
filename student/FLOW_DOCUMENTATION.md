# Start Learning & Purchase Flow Documentation

## 1. Course Purchase Flow
**Objective**: Enable students to enroll in a course.

**Steps**:
1.  **User Navigation**: User navigates to `/course/:id` (e.g., `/course/15`).
2.  **Data Fetching**:
    *   `CourseDetailsPage` calls `courseService.getCourseDetails(id)`.
    *   Response object includes `is_enrolled` (boolean) to indicate status.
3.  **UI State - Not Enrolled**:
    *   Sidebar displays "Subscribe Now" / "Buy Course" button.
    *   Course content (accordion) shows locked icons for non-free lessons.
4.  **Action**:
    *   User clicks "Buy Course".
    *   Dialog confirmation appears (Browser `confirm`).
    *   `handlePurchase` function is triggered.
5.  **API Call**:
    *   `paymentService.purchaseCourse(courseId)` is called.
    *   Endpoint: `POST /api/payments/purchases/purchase_course/`.
    *   Payload: `{ "course_id": 15 }`.
6.  **Success Handling**:
    *   Alert "Purchase Successful".
    *   Page calls `fetchCourseDetails()` again to refresh data.
    *   `is_enrolled` becomes `true`.
    *   UI updates to show "Start Learning" and unlocks lessons.

## 2. Watch Videos Flow (Start Learning)
**Objective**: Allow enrolled students to watch content.

**Steps**:
1.  **Entry Point**:
    *   User clicks "Start Learning" from Course Details Sidebar.
    *   OR User clicks "Enter" on a specific lesson in the Accordion.
2.  **Routing**:
    *   "Start Learning" redirects to `/course/:id/player`.
    *   Specific lesson redirects to `/course/:id/lecture/:lectureId`.
3.  **Player Authorization** (`CoursePlayerPage.js`):
    *   Checks `isAuthenticated` (redirects to login if false).
    *   Calls `courseService.getCourseDetails(id)` to verify `is_enrolled`.
    *   Calls `courseService.getCourseContent(id)` to get ALL lectures/sections.
4.  **Content Resolution**:
    *   If no `lectureId` in URL, client logic finds the first available lecture and redirects.
    *   If `lectureId` is present, it looks up the lecture object in the fetched content array.
5.  **Video Playback**:
    *   If `lecture.video_url` exists:
        *   Checks if URL is absolute (`http...`) or relative.
        *   If relative, prepends `BASE_URL` (`http://72.62.232.8`).
        *   Renders `ReactPlayer`.
    *   If `video_url` is missing/null:
        *   Displays text content (`content` or `description`) instead.
6.  **Navigation**:
    *   Sidebar allows switching between lessons instantly (client-side state update).


## 3. Non-Enrolled Experience
**Objective**: Show value without giving access.

**Behavior**:
1.  **Details Page**: See full syllabus, instructor info, and "Locked" indicators on lessons.
2.  **Player Page Access Attempt**:
    *   If a non-enrolled user tries to access `/course/:id/player`:
    *   `getCourseDetails` returns `is_enrolled: false`.
    *   Player logic checks `!course.is_enrolled && !lecture.is_free`.
    *   User receives an alert or error UI: "You must subscribe to view this content".


## 4. Registration Flow
**Objective**: Register a new student account.

**Steps**:
1.  **Initial State**:
    *   User lands on `/register`.
    *   Instruction modal appears (first visit).

2.  **Form Interaction**:
    *   **Single Step**: All registration fields are displayed at once.
    *   **Fields**:
        *   First Name (`firstName`) & Last Name (`lastName`)
        *   Student Phone (`phone`) - Validated: Egyptian Mobile (`^01[0-9]{9}$`)
        *   Guardian Phone (`fatherPhone`) - Validated: Egyptian Mobile (`^01[0-9]{9}$`)
        *   Grade (`grade`) - Dropdown (Grade 10, 11, 12).
        *   Email (`email`) - Valid email format.
        *   Password (`password`) - Min 6 characters.
        *   Confirm Password (`confirmPassword`) - Must match Password.
    *   **Validation**:
        *   Real-time and on-submit validation using Yup schema.
        *   Form cannot be submitted with invalid fields.

3.  **Submission**:
    *   Button: "Create Account" (`إنشاء الحساب`).
    *   Triggers API call if validation passes.

4.  **API Integration**:
    *   **Endpoint**: `POST /api/users/auth/register/`
    *   **Payload Construction**:
        ```json
        {
          "email": "user@example.com",
          "password": "***",
          "password2": "***",
          "full_name": "First Last",
          "phone": "01xxxxxxxxx",
          "guardian_phone": "01xxxxxxxxx",
          "grade": "Grade 10" // Mapped from UI selection
        }
        ```

5.  **Response Handling**:
    *   **Success**:
        *   Alert "Account created successfully".
        *   Redirect to `/login`.
    *   **Error**:
        *   Parse DRF error response (JSON object).
        *   Display specific field errors (e.g., "Email already exists") clearly to the user.
