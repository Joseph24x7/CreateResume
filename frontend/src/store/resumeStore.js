import { create } from 'zustand'
import { resumeApi } from '../api/resumeApi'

const newUuid = () => crypto.randomUUID()

export const defaultData = () => ({
  personalInfo: {
    firstName: 'Joseph Praveen',
    lastName: 'Kumar S',
    title: 'AVP - Application Development',
    email: 'joseph.praveen@example.com',
    phone: '+91 98765 43210',
    location: 'Chennai, India',
    linkedin: 'linkedin.com/in/josephpraveen',
    github: 'github.com/josephpraveen',
    website: 'josephpraveen.dev',
    leetcode: 'leetcode.com/josephpraveen',
  },
  summary: 'Senior Software Developer and AVP with 11+ years of experience in Java Enterprise development, microservices, cloud applications, and frontend frameworks. Skilled in leading teams and designing high-throughput, low-latency financial systems.',
  skillCategories: [
    { id: newUuid(), category: 'Languages', skills: 'Java 21 | SQL | JavaScript | HTML/CSS' },
    { id: newUuid(), category: 'Frameworks', skills: 'Spring Boot 4 | Spring Cloud | Hibernate | React' },
    { id: newUuid(), category: 'Tools & Infra', skills: 'Docker | Kubernetes | AWS | Git | Maven' }
  ],
  experiences: [
    {
      id: newUuid(),
      role: 'AVP - Application Development',
      company: 'Major Financial Institution',
      startDate: '06/2021',
      endDate: 'Present',
      location: 'Chennai, India',
      project: 'Custody Tax Reclaims Platform',
      achievements: [
        'Led a team of 8 developers in migrating a legacy monolithic custody platform to Spring Boot microservices.',
        'Designed and implemented a real-time event-driven transaction processing system handling 1M+ daily transactions.',
        'Reduced processing latencies by 45% using Project Loom virtual threads and optimized JPA database queries.'
      ]
    },
    {
      id: newUuid(),
      role: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      startDate: '08/2016',
      endDate: '05/2021',
      location: 'Chennai, India',
      project: 'Core Banking Integration',
      achievements: [
        'Developed reusable REST APIs and SOAP integrations connecting third-party payment gateways.',
        'Mentored 4 junior engineers and implemented standard CI/CD pipelines reducing deployment times by 50%.'
      ]
    }
  ],
  achievements: [
    { id: newUuid(), text: 'Spot Award for Outstanding Delivery of Custody Tax Reclaims in Q3 2023.' },
    { id: newUuid(), text: 'Successfully migrated 12 legacy applications to cloud-native platforms ahead of schedule.' }
  ],
  educations: [
    {
      id: newUuid(),
      degree: 'Bachelor of Engineering in Computer Science',
      institution: 'Sathyabama University',
      startDate: '08/2011',
      endDate: '04/2015',
      location: 'Chennai, India'
    }
  ],
  languages: [
    { id: newUuid(), language: 'English', proficiency: 'Full Professional Proficiency' },
    { id: newUuid(), language: 'Tamil', proficiency: 'Native or Bilingual Proficiency' }
  ],
  hiddenSections: [],
  font: 'Inter',
})

const useResumeStore = create((set, get) => ({
  resume: null,
  resumeList: [],
  loading: false,
  saving: false,
  lastSaved: null,
  error: null,
  activeSection: 'personal',

  toggleSection: (sectionId) =>
    set(state => {
      if (!state.resume) return {}
      const data = state.resume.data || {}
      const hidden = data.hiddenSections || []
      const newHidden = hidden.includes(sectionId)
        ? hidden.filter(id => id !== sectionId)
        : [...hidden, sectionId]
      return {
        resume: {
          ...state.resume,
          data: { ...data, hiddenSections: newHidden }
        }
      }
    }),

  setActiveSection: (section) => set({ activeSection: section }),

  setError: (error) => set({ error }),

  updateTitle: (title) =>
    set(state => ({ resume: { ...state.resume, title } })),

  updateData: (patch) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, ...patch } },
    })),

  updatePersonalInfo: (personalInfo) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, personalInfo } },
    })),

  updateSummary: (summary) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, summary } },
    })),

  updateSkillCategories: (skillCategories) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, skillCategories } },
    })),

  updateExperiences: (experiences) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, experiences } },
    })),

  updateAchievements: (achievements) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, achievements } },
    })),

  updateEducations: (educations) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, educations } },
    })),

  updateLanguages: (languages) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, languages } },
    })),

  updateFont: (font) =>
    set(state => ({
      resume: { ...state.resume, data: { ...state.resume.data, font } },
    })),

  fetchResumeList: async () => {
    set({ loading: true, error: null })
    try {
      const list = await resumeApi.getAll()
      set({ resumeList: list, loading: false })
    } catch {
      set({ error: 'Failed to load resumes', loading: false })
    }
  },

  loadResume: async (id) => {
    set({ loading: true, error: null })
    try {
      const resume = await resumeApi.getById(id)
      set({ resume, loading: false, lastSaved: new Date() })
    } catch {
      set({ error: 'Resume not found', loading: false })
    }
  },

  createResume: async (title) => {
    const resume = await resumeApi.create({ title: title || 'Untitled Resume' })
    set(state => ({ resumeList: [resume, ...state.resumeList] }))
    return resume.id
  },

  saveResume: async () => {
    const { resume } = get()
    if (!resume) return
    set({ saving: true })
    try {
      const updated = await resumeApi.update(resume.id, {
        title: resume.title,
        data: resume.data,
      })
      set({ resume: updated, saving: false, lastSaved: new Date() })
    } catch {
      set({ saving: false, error: 'Save failed' })
    }
  },

  deleteResume: async (id) => {
    await resumeApi.delete(id)
    set(state => ({ resumeList: state.resumeList.filter(r => r.id !== id) }))
  },

  downloadPdf: async () => {
    const { resume } = get()
    if (!resume) return
    await resumeApi.downloadPdf(resume.id, `${resume.title}.pdf`)
  },
}))

export default useResumeStore
