import { useState } from 'react'
import useResumeStore from '../../store/resumeStore'
import { formatResumeToText } from '../../utils/resumeFormatter'

export default function InterviewWorkspace() {
  const resume = useResumeStore((s) => s.resume)
  const [jobTitle, setJobTitle] = useState(resume?.data?.personalInfo?.title || '')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [evaluating, setEvaluating] = useState({})

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const resumeText = formatResumeToText(resume)
      const geminiKey = localStorage.getItem('gemini_api_key') || ''

      const res = await fetch('http://localhost:8080/api/v1/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-Key': geminiKey,
        },
        body: JSON.stringify({
          resumeText,
          jobTitle,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setQuestions(data || [])
        // reset states
        setAnswers({})
        setEvaluations({})
      } else {
        alert('Failed to generate interview questions.')
      }
    } catch (err) {
      console.error(err)
      alert('Error connecting to AI service.')
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async (qIdx, question) => {
    const answer = answers[qIdx] || ''
    if (!answer.trim()) {
      alert('Please enter an answer to evaluate.')
      return
    }

    setEvaluating((prev) => ({ ...prev, [qIdx]: true }))
    try {
      const geminiKey = localStorage.getItem('gemini_api_key') || ''

      const res = await fetch('http://localhost:8080/api/v1/ai/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-Key': geminiKey,
        },
        body: JSON.stringify({
          question,
          answer,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setEvaluations((prev) => ({ ...prev, [qIdx]: data }))
      } else {
        alert('Failed to evaluate answer.')
      }
    } catch (err) {
      console.error(err)
      alert('Error connecting to AI service.')
    } finally {
      setEvaluating((prev) => ({ ...prev, [qIdx]: false }))
    }
  }

  return (
    <div className="workspace-container">
      <style>{`
        .workspace-container {
          padding: 32px;
          color: #f8fafc;
          overflow-y: auto;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          gap: 32px;
        }
        .prep-panel-left {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 24px;
          flex-shrink: 0;
          height: fit-content;
        }
        .prep-panel-right {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }
        .ws-title {
          font-size: 20px;
          font-weight: 600;
          color: #f8fafc;
          margin: 0 0 4px 0;
        }
        .ws-desc {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 16px 0;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
        }
        .form-group input {
          background: #0f172a;
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          border-color: #0284c7;
        }
        .btn-ws {
          background: #0284c7;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          text-align: center;
        }
        .btn-ws:hover:not(:disabled) {
          background: #0369a1;
        }
        .btn-ws:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .question-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .q-header {
          font-size: 15px;
          font-weight: 600;
          color: #f8fafc;
          line-height: 1.5;
        }
        .ans-textarea {
          width: 100%;
          min-height: 80px;
          background: #0f172a;
          border: 1px solid #334155;
          color: #cbd5e1;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 13px;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          font-family: inherit;
        }
        .ans-textarea:focus {
          border-color: #0284c7;
        }
        .eval-box {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 16px;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .eval-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .grade-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .grade-badge.strong {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .grade-badge.good {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .grade-badge.needs-work {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .eval-feedback {
          color: #cbd5e1;
          line-height: 1.5;
        }
        .eval-model {
          color: #94a3b8;
          line-height: 1.5;
          border-top: 1px dashed #334155;
          padding-top: 10px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          padding: 64px 24px;
          gap: 16px;
          background: #1e293b;
          border: 1px dashed #334155;
          border-radius: 12px;
          text-align: center;
        }
        .empty-icon {
          font-size: 48px;
        }
      `}</style>

      <div className="prep-panel-left">
        <div>
          <h3 className="ws-title">AI Interview Prep</h3>
          <p className="ws-desc">Generate tailored mock interview questions based on your qualifications and practice your pitches.</p>
        </div>

        <div className="form-group">
          <label htmlFor="job-title-ip">Target Job Title</label>
          <input
            id="job-title-ip"
            type="text"
            placeholder="e.g. Senior Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <button className="btn-ws" onClick={handleGenerate} disabled={loading || !jobTitle}>
          {loading ? 'Analyzing resume & generating...' : 'Generate Questions ✦'}
        </button>
      </div>

      <div className="prep-panel-right">
        {questions.length > 0 ? (
          questions.map((q, idx) => (
            <div className="question-card" key={idx}>
              <div className="q-header">Q{idx + 1}: {q}</div>
              
              <textarea
                className="ans-textarea"
                placeholder="Type your response here..."
                value={answers[idx] || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
              />

              <button
                className="btn-ws"
                style={{ width: 'fit-content', padding: '8px 16px', fontSize: '13px', background: '#334155', border: '1px solid #475569' }}
                onClick={() => handleEvaluate(idx, q)}
                disabled={evaluating[idx]}
              >
                {evaluating[idx] ? 'Evaluating response...' : 'Get AI Feedback'}
              </button>

              {evaluations[idx] && (
                <div className="eval-box">
                  <div className="eval-header">
                    <span style={{ fontWeight: '600', color: '#cbd5e1' }}>Evaluation Results</span>
                    <span className={`grade-badge ${evaluations[idx].grade?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {evaluations[idx].grade}
                    </span>
                  </div>
                  <div className="eval-feedback">
                    <strong>Feedback:</strong> {evaluations[idx].feedback}
                  </div>
                  <div className="eval-model">
                    <strong>Suggested Model Answer:</strong> {evaluations[idx].modelAnswer}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#cbd5e1' }}>No interview questions yet</p>
              <p style={{ margin: 0, fontSize: '13px' }}>Click the "Generate Questions" button on the left to start practicing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
