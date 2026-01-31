// src/components/ui/TeacherExamsTable.jsx
import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrash, FaEye, FaFileAlt } from 'react-icons/fa'

import quizApi from '../api/quiz.service'
const TeacherExamsTable = ({ quizzes, setQuizzes, quizzesCount, setQuizzesCount }) => {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  // "questions" | "edit" | "delete"

  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const openQuestionsModal = (quiz) => {
    setShowModal(true)
    setSelectedQuiz(quiz)
    setModalType('questions')
  }
  const openEditModal = (quiz) => {
    setShowModal(true)

    setSelectedQuiz(quiz)
    setModalType('edit')
  }

  const openDeleteModal = (quiz) => {
    setShowModal(true)
    setSelectedQuiz(quiz)
    setModalType('delete')
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedQuiz(null)
  }

  const onDelete = async (quiz) => {
    try {
      const res = await quizApi.deleteStudentQuiz(quiz.id)
      setShowModal(false)
      setQuizzes(quizzes.filter((q) => q.id !== quiz.id))
      setQuizzesCount(quizzesCount - 1)
    } catch (error) {}
  }

  const onEdit = async (quiz, data) => {
    try {
      const res = await quizApi.editStudentQuiz(quiz.id, JSON.stringify(data))
      setShowModal(false)
    } catch (error) {}
  }

  return (
    <>
      {showModal && (
        <>
          <div className="modal-backdrop fade show "></div>

          {modalType && (
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content shadow-lg rounded-4">
                  {/* HEADER */}
                  <div
                    className={`modal-header text-white ${
                      modalType === 'delete'
                        ? 'bg-danger'
                        : modalType === 'edit'
                          ? 'bg-warning'
                          : 'bg-primary'
                    }`}
                  >
                    <h5 className="modal-title">
                      {modalType === 'questions' && 'أسئلة الكويز'}
                      {modalType === 'edit' && 'تعديل الامتحان'}
                      {modalType === 'delete' && 'حذف الامتحان'}
                    </h5>

                    <button className="btn-close btn-close-white" onClick={closeModal} />
                  </div>

                  {/* BODY */}
                  <div className="modal-body">
                    {/* QUESTIONS */}
                    {modalType === 'questions' && (
                      <>
                        {selectedQuiz?.questions?.length ? (
                          selectedQuiz.questions.map((q, i) => (
                            <div key={i} className="card mb-3 shadow-sm border-0">
                              <div className="card-body">
                                <strong>
                                  {i + 1}. {q.text}
                                </strong>

                                <ul className="list-group list-group-flush mt-2">
                                  {q.options.map((opt, idx) => (
                                    <li
                                      key={idx}
                                      className={`list-group-item ${
                                        opt === q.correct_answer ? 'list-group-item-success' : ''
                                      }`}
                                    >
                                      {opt}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted text-center">لا توجد أسئلة</p>
                        )}
                      </>
                    )}

                    {/* EDIT */}
                    {modalType === 'edit' && (
                      <form name='editForm'>
                        <div className="mb-3">
                          <label className="form-label">اسم الامتحان</label>
                          <input
                            name="title"
                            className="form-control"
                            defaultValue={selectedQuiz?.title}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">وصف الامتحان</label>
                          <textarea
                            className="form-control"
                            defaultValue={selectedQuiz?.description}
                            name="description"
                          />
                        </div>
                      </form>
                    )}

                    {/* DELETE */}
                    {modalType === 'delete' && (
                      <p className="text-center">
                        هل أنت متأكد من حذف الامتحان
                        <br />
                        <strong>{selectedQuiz?.title}</strong>؟
                      </p>
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeModal}>
                      إغلاق
                    </button>

                    {modalType === 'edit' && (
                      <button
                        className="btn btn-warning"
                        onClick={() => {
                          onEdit(selectedQuiz)
                        }}
                      >
                        حفظ التعديلات
                      </button>
                    )}

                    {modalType === 'delete' && (
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          onDelete(selectedQuiz)
                        }}
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="table-responsive pb-3">
        <table className="table table-striped table-bordered exams-table">
          <thead>
            <tr>
              <th>رقم المحاضرة</th>
              <th>اسم المحاضرة</th>
              <th>اسم الامتحان</th>
              <th>الوصف</th>
              <th>إجباري</th>
              <th>درجة النجاح</th>
              <th>عدد المحاولات</th>
              <th>طريقة التقييم</th>
              <th>الوقت المحدد</th>
              <th>منشور</th>
              <th>عدد الأسئلة</th>
              <th>إجمالي الدرجات</th>
              <th>تاريخ الإنشاء</th>
              <th>آخر تعديل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.lecture}</td>

                <td>
                  <span className="fw-semibold">{quiz.lecture_title}</span>
                </td>

                <td>
                  <div className="d-flex align-items-center">
                    <FaFileAlt className="text-primary me-2" />
                    <span className="fw-semibold">{quiz.title}</span>
                  </div>
                </td>

                <td>{quiz.description}</td>

                <td>
                  <span className={`badge ${quiz.is_mandatory ? 'bg-danger' : 'bg-secondary'}`}>
                    {quiz.is_mandatory ? 'نعم' : 'لا'}
                  </span>
                </td>

                <td>{quiz.passing_grade}%</td>

                <td>{quiz.max_attempts}</td>

                <td>
                  <span className="badge bg-info">
                    {quiz.grading_method === 'highest' ? 'أعلى درجة' : quiz.grading_method}
                  </span>
                </td>

                <td>{quiz.time_limit_minutes ? `${quiz.time_limit_minutes} دقيقة` : 'غير محدد'}</td>

                <td>
                  <span className={`badge ${quiz.is_published ? 'bg-success' : 'bg-warning'}`}>
                    {quiz.is_published ? 'منشور' : 'غير منشور'}
                  </span>
                </td>

                <td>{quiz.question_count}</td>

                <td>{quiz.total_points}</td>

                <td>{new Date(quiz.created_at).toLocaleDateString()}</td>

                <td>{new Date(quiz.updated_at).toLocaleDateString()}</td>

                <td>
                  <div className="exam-actions">
                    <button
                      onClick={() => openQuestionsModal(quiz)}
                      className="btn btn-sm btn-outline-primary"
                      title="عرض"
                    >
                      <FaEye />
                    </button>

                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => openEditModal(quiz)}
                      title="تعديل"
                    >
                      <FaEdit />
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => openDeleteModal(quiz)}
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default TeacherExamsTable
