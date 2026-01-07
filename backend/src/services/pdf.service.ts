import PDFDocument from 'pdfkit';
import { Analysis as PrismaAnalysis } from '@prisma/client';

export function generateAnalysisPDF(analysis: PrismaAnalysis, userName?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Professional Header with Gradient Effect (simulated)
    doc.rect(0, 0, doc.page.width, 120).fill('#0d9488');
    
    // White text on teal background
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#ffffff')
      .text('Creative Analysis Report', 50, 35, { align: 'center' });
    
    doc.fontSize(12).font('Helvetica').fillColor('#ffffff')
      .text(`Prepared by: ${userName || 'Your Agency Name'}`, { align: 'center' });
    
    doc.fontSize(10).fillColor('#e0f2f1')
      .text(`Report Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, { align: 'center' });
    
    doc.fillColor('#000000'); // Reset to black
    doc.moveDown(4);

    // Creative Details Section
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Creative Details');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    doc.text(`Objective: ${analysis.objective.replace('_', ' ')}`);
    doc.text(`Creative Type: ${analysis.creativeType}`);
    
    if (analysis.headline) {
      doc.moveDown(0.5);
      doc.text(`Headline: ${analysis.headline}`);
    }
    
    if (analysis.primaryText) {
      doc.moveDown(0.5);
      doc.text(`Primary Text: ${analysis.primaryText}`);
    }

    doc.moveDown(1.5);

    // Metrics Section
    doc.fontSize(14).font('Helvetica-Bold').text('Performance Metrics');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    
    const metrics = [];
    if (typeof analysis.cpm === 'number') metrics.push(`CPM: $${analysis.cpm.toFixed(2)}`);
    if (typeof analysis.ctr === 'number') metrics.push(`CTR: ${analysis.ctr.toFixed(2)}%`);
    if (typeof analysis.cpa === 'number') metrics.push(`CPA: $${analysis.cpa.toFixed(2)}`);
    
    if (metrics.length > 0) {
      doc.text(metrics.join('  |  '));
    } else {
      doc.text('No metrics provided');
    }

    doc.moveDown(1.5);

    // Analysis Result Section
    doc.fontSize(14).font('Helvetica-Bold').text('Analysis Result');
    doc.moveDown(0.5);

    // Result Type Badge
    const resultColors: Record<string, string> = {
      DEAD: '#dc2626',
      AVERAGE: '#f59e0b',
      WINNING: '#16a34a'
    };
    doc.fontSize(12).font('Helvetica-Bold')
      .fillColor(resultColors[analysis.resultType] || '#666666')
      .text(`Status: ${analysis.resultType}`);
    
    doc.moveDown(1);

    // Primary Reason
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('Primary Reason:');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').text(analysis.primaryReason);

    doc.moveDown(1);

    // Supporting Logic
    doc.fontSize(12).font('Helvetica-Bold').text('Supporting Logic:');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica');

    const logic = Array.isArray(analysis.supportingLogic)
      ? analysis.supportingLogic
      : analysis.supportingLogic
      ? (() => {
          try {
            const parsed = JSON.parse(analysis.supportingLogic as unknown as string);
            return Array.isArray(parsed) ? parsed : [String(analysis.supportingLogic)];
          } catch {
            return [String(analysis.supportingLogic)];
          }
        })()
      : [];

    if (!logic.length) {
      doc.text('No supporting points provided');
    } else {
      logic.forEach((point: string) => {
        doc.text(`• ${point}`);
      });
    }

    doc.moveDown(1);

    // Single Fix
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#2563eb').text('Recommended Fix:');
    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica').fillColor('#000000').text(analysis.singleFix);

    doc.moveDown(1.5);

    // Creative Brief Section (if available)
    if (analysis.additionalNotes) {
      // Add page break if needed
      if (doc.y > 600) {
        doc.addPage();
      }
      
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#7c3aed').text('🎨 Creative Director\'s Brief');
      doc.moveDown(0.5);
      
      // Add a colored box background
      const briefY = doc.y;
      const briefText = analysis.additionalNotes;
      const briefHeight = doc.heightOfString(briefText, { width: doc.page.width - 120 });
      
      doc.rect(40, briefY - 10, doc.page.width - 80, briefHeight + 30)
        .fillAndStroke('#f3e8ff', '#e9d5ff');
      
      doc.fontSize(10).font('Helvetica').fillColor('#000000')
        .text(briefText, 50, briefY, { width: doc.page.width - 100 });
      
      doc.moveDown(2);
    }

    // Professional Footer
    const footerY = doc.page.height - 80;
    doc.rect(0, footerY, doc.page.width, 80).fill('#f3f4f6');
    
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0d9488')
      .text('Powered by Jupho Pro', 50, footerY + 20, { align: 'center' });
    
    doc.fontSize(8).font('Helvetica').fillColor('#6b7280')
      .text('Professional Meta Ads Creative Analysis Tool', { align: 'center' });
    
    doc.fontSize(8).fillColor('#9ca3af')
      .text('This report contains confidential analysis. Share with authorized personnel only.', { align: 'center' });

    doc.end();
  });
}
