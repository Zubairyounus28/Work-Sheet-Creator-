import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { ExamData } from "../types";

export const generateExamDocx = async (data: ExamData, customHeader?: string): Promise<Blob> => {
  const children = [];

  // 1. Institution Header
  children.push(
    new Paragraph({
      text: (customHeader || data.institution).toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      style: "Header1"
    })
  );

  // 2. Subject
  children.push(
    new Paragraph({
      text: `${data.subject} Examination`.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      style: "Header2"
    })
  );

  // 3. Metadata Row (Grade, Duration, Date)
  children.push(
    new Paragraph({
        children: [
            new TextRun({ text: `Grade: ${data.grade}`, bold: true }),
            new TextRun({ text: "\t\t" }),
            new TextRun({ text: `Time: ${data.duration}`, bold: true }),
            new TextRun({ text: "\t\t" }),
            new TextRun({ text: `Date: ${data.date || "________"}`, bold: true }),
        ],
        alignment: AlignmentType.CENTER,
        border: {
            bottom: { color: "000000", space: 10, style: BorderStyle.SINGLE, size: 12 }
        },
        spacing: { after: 400 },
        tabStops: [
            { type: "center", position: 4500 },
            { type: "right", position: 9000 },
        ],
    })
  );

  // 4. Instructions
  if (data.instructions && data.instructions.length > 0) {
    children.push(
        new Paragraph({
            text: "INSTRUCTIONS TO CANDIDATES:",
            bold: true,
            spacing: { before: 200, after: 100 },
        })
    );
    data.instructions.forEach(inst => {
        children.push(
            new Paragraph({
                text: inst,
                bullet: { level: 0 },
                spacing: { after: 100 }
            })
        );
    });
    children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
  }

  // 5. Questions
  data.questions.forEach((q) => {
    // We split the text by newlines to properly format multi-line paragraphs in Word
    const lines = q.text.split('\n');
    const textRuns = lines.map((line, index) => {
        return new TextRun({ 
            text: line,
            // Add a break for every line except the first one (to start it on a new line)
            break: index > 0 ? 1 : 0 
        });
    });

    children.push(
      new Paragraph({
        children: [
            new TextRun({ text: `${q.number}. `, bold: true }),
            ...textRuns,
            new TextRun({ text: `  [${q.marks} Marks]`, bold: true, italics: true }),
        ],
        spacing: { before: 200, after: 100 },
        indent: { left: 0, hanging: 360 } // Hanging indent for numbers
      })
    );

    // Answer Lines - only if it seems like a question that needs space
    // If the text is very long (like notes), we might not need as many lines, 
    // but the prompt logic usually implies 2-4 lines for exams.
    const linesCount = q.marks > 2 ? 3 : 2;
    for (let i = 0; i < linesCount; i++) {
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
          text: "*** End of Examination ***",
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          italics: true
      })
  );

  const doc = new Document({
    styles: {
        default: {
            document: {
                run: {
                    font: "Times New Roman",
                    size: 24, // 12pt
                },
                paragraph: {
                    spacing: {
                        line: 276, // 1.15 line spacing
                    },
                },
            },
            heading1: {
                run: {
                    font: "Times New Roman",
                    size: 32, // 16pt
                    bold: true,
                    color: "000000",
                },
                paragraph: {
                    spacing: {
                        after: 120,
                    },
                },
            },
            heading2: {
                 run: {
                    font: "Times New Roman",
                    size: 28, // 14pt
                    bold: true,
                    color: "000000",
                },
            }
        },
    },
    sections: [
      {
        properties: {
            page: {
                margin: {
                    top: 1440, // 1 inch
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                },
            },
        },
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};