import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { ExamData } from "../types";

export const generateExamDocx = async (data: ExamData, customHeader?: string): Promise<Blob> => {
  const children = [];

  // 1. Institution Header
  children.push(
    new Paragraph({
      text: customHeader || data.institution,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // 2. Subject
  children.push(
    new Paragraph({
      text: `${data.subject} Examination`,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // 3. Metadata Row (Grade, Duration, Date)
  const metaText = `Grade: ${data.grade}    |    Duration: ${data.duration}    |    Date: ${data.date || "________"}`;
  children.push(
    new Paragraph({
      children: [
        new TextRun({
            text: metaText,
            bold: true,
            size: 24, // 12pt
        })
      ],
      alignment: AlignmentType.CENTER,
      border: {
        bottom: { color: "000000", space: 10, style: BorderStyle.SINGLE, size: 6 }
      },
      spacing: { after: 400 },
    })
  );

  // 4. Instructions
  if (data.instructions && data.instructions.length > 0) {
    children.push(
        new Paragraph({
            text: "Instructions:",
            bold: true,
            spacing: { before: 200, after: 100 },
        })
    );
    data.instructions.forEach(inst => {
        children.push(
            new Paragraph({
                text: inst,
                bullet: { level: 0 }
            })
        );
    });
    children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  // 5. Questions
  data.questions.forEach((q) => {
    // Question Text
    children.push(
      new Paragraph({
        children: [
            new TextRun({ text: `${q.number}. `, bold: true }),
            new TextRun({ text: q.text }),
            new TextRun({ text: `  [${q.marks} Marks]`, bold: true, italics: true }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    // Answer Lines
    const lines = q.marks > 2 ? 4 : 2;
    for (let i = 0; i < lines; i++) {
        children.push(
            new Paragraph({
                text: "__________________________________________________________________________",
                spacing: { after: 100 },
                style: "Normal"
            })
        );
    }
  });

  // Footer
  children.push(
      new Paragraph({
          text: "*** End of Paper ***",
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 }
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};