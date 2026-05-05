'use client'
import { useState } from 'react'

export default function SettlementPage() {
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = today.slice(0, 7) + '-01'
  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo] = useState(today)

  function download() {
    window.open(`/api/admin/settlement?from=${from}&to=${to}`, '_blank')
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-bold mb-4">정산 CSV</h1>
      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">시작일</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">종료일</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <button onClick={download}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium">
          CSV 다운로드
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        다운로드된 파일을 엑셀로 열어 사조 측에 전달하세요.<br />
        인코딩: UTF-8 (엑셀에서 열 때 &quot;텍스트 가져오기 마법사&quot; 사용)
      </p>
    </div>
  )
}
