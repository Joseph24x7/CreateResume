export function formatResumeToText(resume) {
  if (!resume || !resume.data) return ''
  const { personalInfo = {}, summary = '', experiences = [], educations = [], skillCategories = [], languages = [] } = resume.data
  
  let text = `Name: ${personalInfo.firstName || ''} ${personalInfo.lastName || ''}\n`
  text += `Title: ${personalInfo.title || ''}\n`
  text += `Summary: ${summary}\n\n`
  
  text += `Skills:\n`
  skillCategories.forEach(s => {
    text += `- ${s.category}: ${s.skills}\n`
  })
  
  text += `\nExperience:\n`
  experiences.forEach(e => {
    text += `- ${e.role} at ${e.company} (${e.startDate} - ${e.endDate})\n`
    if (e.project) text += `  Project: ${e.project}\n`
    if (e.achievements) {
      e.achievements.forEach(ach => {
        text += `  * ${ach}\n`
      })
    }
  })
  
  text += `\nEducation:\n`
  educations.forEach(edu => {
    text += `- ${edu.degree} from ${edu.institution} (${edu.startDate} - ${edu.endDate})\n`
  })
  
  text += `\nLanguages:\n`
  languages.forEach(l => {
    text += `- ${l.language} (${l.proficiency})\n`
  })
  
  return text
}
