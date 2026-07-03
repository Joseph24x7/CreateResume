import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

export const resumeApi = {
  getAll: () => api.get('/resumes').then(r => r.data),
  getById: (id) => api.get(`/resumes/${id}`).then(r => r.data),
  create: (payload) => api.post('/resumes', payload).then(r => r.data),
  update: (id, payload) => api.put(`/resumes/${id}`, payload).then(r => r.data),
  delete: (id) => api.delete(`/resumes/${id}`),
  downloadPdf: async (id, filename) => {
    const response = await api.post(`/resumes/${id}/export/pdf`, {}, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || 'resume.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
