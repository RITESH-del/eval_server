import prisma from "../../db.js";
import { randomUUID } from "crypto";

export const createLab = (exam, facultyId) => {
    const { target_section, ...examData } = exam;

    let sections = [];
    if (Array.isArray(target_section)) {
        sections = target_section;
    } else if (typeof target_section === "string") {
        sections = target_section.split(",").map(s => s.trim()).filter(Boolean);
    }

    const dataToCreate = {
        id: randomUUID(),
        ...examData
    };

    if (sections.length > 0) {
        dataToCreate.exam_target_sections = {
            create: sections.map(sec => ({
                section: sec
            }))
        };
    }

    return prisma.exams.create({ data: dataToCreate });
}

export const getLabs = (facultyId) => {
    return prisma.exams.findMany({
        where: {
            created_by: facultyId
        },
        include: {
            exam_target_sections: true
        }
    })
}
 

export const getLabDetails = (examId) => {
    return prisma.student_exam_sessions.findMany({
        where: {
            exam_id: examId
        },
        include: {
          users: true,
          exams: {
              include: {
                  exam_target_sections: true
              }
          },
          submissions: true
        }
    })
}

// use it later 
export const updateLab = (examId, examData) => {
    const { target_section, ...otherData } = examData;

    let sections = [];
    if (Array.isArray(target_section)) {
        sections = target_section;
    } else if (typeof target_section === "string") {
        sections = target_section.split(",").map(s => s.trim()).filter(Boolean);
    }

    const updateData = { ...otherData };

    if (target_section !== undefined) {
        updateData.exam_target_sections = {
            deleteMany: {},
            create: sections.map(sec => ({
                section: sec
            }))
        };
    }

    return prisma.exams.update({
        where: {
            id: examId
        },
        data: updateData
    });
}

// may need later
export const deleteLab = (examId) => {
    return prisma.exams.delete({
        where: {
            id: examId
        }
    })
}   



export const getAllSubmissions = async (examId) => {
const sessions =  await prisma.student_exam_sessions.findMany({
  where: {
    exam_id: examId
  }
});

return sessions;
}


export const getSubmissionById = async (examId, sessionId) => {
  const session = await prisma.student_exam_sessions.findFirst({
  where: {
    id: sessionId,
    exam_id: examId,
  },
  include: {
    users: true,
    exams: true,
    submissions: {
      include: {
        question_bank: true,
      },
      orderBy: {
        created_at: "asc",
      },
    },
  },
});

  if (!session) return null;

  return session;
};


export const years = async () => await prisma.users.findMany({
  distinct: ["graduation_year"],
  select: {
    graduation_year: true
  }
});

export const sections = async () => await prisma.users.findMany({
  where: { role: "student" },
  distinct: ["section"],
  select: {
    section: true
  }
});

// build repository for exam sessions
export const getSessions = async () => {
  return await prisma.student_exam_sessions.findMany({
    include: {
      users: true,
      exams: true,
      submissions: true
    }
  })
}


