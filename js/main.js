console.log('SelamatBio site loaded successfully!');

document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Results Dual-Use Quickscan - Biosecurity Office", 10, 10);

    doc.setFontSize(12);
    doc.text("Date: " + new Date().toLocaleDateString(), 10, 20);

    doc.setFontSize(10);
    let yOffset = 30;

    // Process each question and result
    for (let i = 1; i <= 15; i++) {
        let question = document.querySelector(`input[name="question${i}"]`).parentElement.previousElementSibling.innerText;
        let answer = document.querySelector(`input[name="question${i}"]:checked`);
        answer = answer ? answer.value : "No answer";

        doc.setFont("helvetica", "bold");
        doc.text(`${i}. ${question}`, 10, yOffset);
        yOffset += 10;

        doc.setFont("helvetica", "normal");
        doc.text(`Answer: ${answer}`, 10, yOffset);
        yOffset += 15;

        if (yOffset > 270) {
            doc.addPage();
            yOffset = 10;
        }
    }

    // Save the PDF
    doc.save('durc_quickscan_results.pdf');

    // Redirect to the results page after the PDF is saved
    window.location.href = 'durc-results.html';
});
