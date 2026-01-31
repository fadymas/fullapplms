// src/components/codes/CodesTable.jsx
import { useState } from 'react'
import { FaCopy, FaTrash, FaFilter } from 'react-icons/fa'
import { BiCheck } from 'react-icons/bi'
import adminRechargeCodesService from '../api/admin/recharge-codes.service'
import CodeFilters from './CodeFilters'

const CodesTable = ({
  codes,
  filteredCodes,
  showFilters,
  setShowFilters,
  setCodes,
  codesCount,
  getCodes,
  is_used,
  setIsUsed
}) => {
  const [isCopied, setisCopied] = useState(false)

  /* ================= Pagination ================= */

  /* ================= Handlers ================= */
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setisCopied(code)
    setTimeout(() => {
      setisCopied(false)
    }, 3000)
  }

  const handleDeleteCode = async (codeId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكود؟')) {
      await adminRechargeCodesService.deleteCode(codeId)
    }
  }

  const handleCreateCode = async () => {
    const code = prompt('Enter the code:')

    if (!code) {
      alert('Code is required')
      return
    }

    const amount = Number(prompt('Enter the amount:'))
    if (isNaN(amount)) {
      alert('Amount must be a number')
      return
    }

    const dateInput = prompt('Enter the expire date (YYYY-MM-DD):')
    if (!dateInput) {
      alert('Expire date is required')
      return
    }

    // Convert to ISO format with end of day
    const expireDate = new Date(`${dateInput}T23:59:59Z`).toISOString()

    alert(`Code: ${code}\nAmount: ${amount}\nExpire Date: ${expireDate}`)
    try {
      const newCode = await adminRechargeCodesService.createCode(code, amount, expireDate)
      setCodes((prevCodes) => [newCode, ...prevCodes])
      alert('code created successfully!')
    } catch (error) {
      alert(error)
    }
  }

  const handleCreatePromoCodes = async () => {
    const prefix = prompt('Enter the prefix (e.g. PROMO):')
    if (!prefix) {
      alert('Prefix is required')
      return
    }

    const amountInput = Number(prompt('Enter the amount:'))
    if (!amountInput || isNaN(Number(amountInput))) {
      alert('Amount must be a valid number')
      return
    }

    const count = Number(prompt('Enter the count:'))
    if (isNaN(count) || count <= 0) {
      alert('Count must be a positive number')
      return
    }

    const dateInput = prompt('Enter the expire date (YYYY-MM-DD):')
    if (!dateInput) {
      alert('Expire date is required')
      return
    }

    // Exact backend format
    const expires_at = `${dateInput}T23:59:59Z`

    const payload = {
      amount: amountInput, // "50.00"
      count,
      prefix,
      expires_at
    }

    alert(
      `Prefix: ${prefix}\nAmount: ${payload.amount}\nCount: ${count}\nExpires At: ${expires_at}`
    )

    try {
      const res = await adminRechargeCodesService.bulkGenerateCodes(
        amountInput,
        count,
        prefix,
        expires_at
      )
      alert(` codes generated successfully!`)
      window.location.reload()
    } catch (error) {
      alert(error)
    }
  }

  /* ================= UI ================= */
  return (
    <div className="card shadow-sm border-0">
      {/* Header */}
      <div className="card-header bg-white border-0 pt-3 pb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-bold text-dark">أكواد الشحن</h6>
            <small className="text-muted">إجمالي {codesCount ?? 0} كود</small>
          </div>

          <div className="d-flex flex-wrap">
            <button
              className="btn btn-outline-primary btn-sm d-flex align-items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-1" />
              تصفية
            </button>

            <button className="btn btn-primary btn-md ms-2" onClick={() => handleCreateCode()}>
              إنشاء كود جديد
            </button>
            <button className="btn btn-md ms-2 btn-info" onClick={() => handleCreatePromoCodes()}>
              إنشاء أكواد ترويجية
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card-body border-bottom">
          <CodeFilters getCodes={getCodes} is_used={is_used} setIsUsed={setIsUsed} />
        </div>
      )}

      {/* Table */}
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-striped table-bordered mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>الكود</th>
                <th>القيمة</th>
                <th>الحالة</th>
                <th>مستخدم بواسطة</th>
                <th>تاريخ الاستخدام</th>
                <th>أنشئ بواسطة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>

            <tbody>
              {codes?.map((code) => (
                <tr key={code.id}>
                  <td>{code.id}</td>

                  <td>
                    <div className="d-flex align-items-center justify-content-between">
                      <code className="bg-light p-1 rounded me-2 flex-grow-1">{code.code}</code>
                      <button
                        className="btn btn-sm btn-outline-secondary flex-shrink-1 "
                        onClick={() => handleCopyCode(code.code)}
                        style={{ width: 'min-content' }}
                      >
                        {isCopied === code.code ? <BiCheck size={12} /> : <FaCopy size={12} />}
                      </button>
                    </div>
                  </td>

                  <td>{code.amount} EGP</td>

                  <td>
                    <span className={`badge ${code.is_used ? 'bg-danger' : 'bg-success'}`}>
                      {code.is_used ? 'مستخدم' : 'غير مستخدم'}
                    </span>
                  </td>

                  <td>{code.used_by_email || '-'}</td>

                  <td>{code.used_at ? new Date(code.used_at).toLocaleString('ar-EG') : '-'}</td>

                  <td>{code.created_by_email}</td>

                  <td>
                    <div className="d-flex justify-content-center gap-1">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteCode(code.id)}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredCodes?.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">لا توجد أكواد</h5>
              <p className="text-muted">لم يتم العثور على أكواد تطابق الفلاتر</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodesTable
