import React, { useState, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./VoterCard.css"; // Import the CSS file

const VoterCard = ({ profile, contribution_data, expenditure_data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { totalAmount, outOfDallasPercentage, selfTotal } = useMemo(() => {
    let totalAmount = 0;
    let outOfDallasAmount = 0;
    let selfTotal = 0;

    expenditure_data.forEach(({ Name, Amount }) => {
        const amount = parseFloat(Amount) || 0;

        if (Name && Name.toLowerCase().includes(profile.name.toLowerCase())) {
            selfTotal += amount;
            }
    });


    contribution_data.forEach(({ Amount, Address }) => {
      const amount = parseFloat(Amount) || 0;
      totalAmount += amount;

      if (Address && !Address.toLowerCase().includes("dallas")) {
        outOfDallasAmount += amount;
      }
    });

    return {
      totalAmount,
      outOfDallasPercentage: totalAmount > 0 ? ((outOfDallasAmount / totalAmount) * 100).toFixed(2) : "0.00",
      selfTotal,
    };
  }, [contribution_data]);

  const generatePDF = () => {
    const cardElement = document.getElementById("voter-card");

    if (!cardElement) {
      alert("Error: Voter Card not found. Please open the modal before downloading.");
      return;
    }

    html2canvas(cardElement, { scale: 2 }).then((canvas) => {
        const imgWidth = 8;
        const imgHeight = (canvas.height / canvas.width) * imgWidth; // Maintain aspect ratio
        const pdf = new jsPDF("landscape", "in", [imgHeight, imgWidth]); // Dynamically adjust dimensions
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight); // Fit image to 4x6 inch frame
      pdf.save("VoterCard.pdf");
    }).catch((error) => {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    });
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">View Voter Card</button>
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Voter Card</h2>
            <div id="voter-card" className="card-container">
              <div className="card-front">
                <img src={`${process.env.PUBLIC_URL}${profile.path_to_headshot_photo}`} alt="Chad West" className="profile-pic" />
                <h1>Chad West</h1>
              </div>
              <div className="card-back">
                <h2>Campaign Finance Summary</h2>
                <p><strong>Contributions from Chad West:</strong> ${selfTotal.toLocaleString()}</p>
                <p><strong>Out-of-Dallas Contributions:</strong> {outOfDallasPercentage}%</p>
              </div>
            </div>
            <button onClick={generatePDF} className="btn btn-secondary">Download PDF</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterCard;
