import { RoomUsageChart } from "../../components/RoomUsageChart.tsx";
import { Button } from "@mantine/core";
import { FaRegFilePdf } from "react-icons/fa6";
import {useRef, useState} from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const Report: React.FC = () => {
  const ranges = ["Week", "Month", "Quarter", "Year"] as const;
  const [loading, setLoading] = useState(false);

  // Create a ref for each chart
  const chartRefs = useRef<Record<typeof ranges[number], HTMLDivElement | null>>({
    Week: null,
    Month: null,
    Quarter: null,
    Year: null,
  });

  const handleSavePDF = async () => {
    setLoading(true);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeightPage = pdf.internal.pageSize.getHeight();

    let yOffset = 0; // vertical position on the page
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const chartDiv = chartRefs.current[range];
      if (!chartDiv) continue;

      const canvas = await html2canvas(chartDiv, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // If adding this chart would exceed page height, add new page
      if (yOffset + imgHeight > pdfHeightPage) {
        pdf.addPage();
        yOffset = 0; // reset vertical position
      }

      pdf.addImage(imgData, "PNG", 0, yOffset, pdfWidth, imgHeight);
      yOffset += imgHeight; // move down for next chart
    }

    pdf.save(`RoomUtilizationReport_${new Date().toISOString().split("T")[0]}.pdf`);
    setLoading(false);
  };

  return (
    <div>
      {ranges.map((range) => (
        <div
          key={range}
          ref={(el) => {
            chartRefs.current[range] = el;
          }}
          className="mb-8"
        >
          <RoomUsageChart range={range} disableSelect={true} />
        </div>
      ))}

      <div className="w-full flex mt-4 justify-end">
        <Button
          variant="filled"
          leftSection={<FaRegFilePdf size={18} />}
          styles={{
            root: {
              backgroundColor: "#073066",
              transition: "background-color 0.3s ease",
              "&:hover": { backgroundColor: "#0a4ca4" },
            },
          }}
          loaderProps={{ type: 'dots' }}
          onClick={handleSavePDF}
          loading={loading}
        >
          Save all ranges as PDF
        </Button>
      </div>
    </div>
  );
};
export default Report