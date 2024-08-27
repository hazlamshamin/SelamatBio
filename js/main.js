console.log('SelamatBio site loaded successfully!');

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded');

    let currentIndex = 0;
    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    if (totalItems > 1) {
        items.forEach((item, index) => {
            if (index !== 0) {
                item.style.display = 'none';
            }
        });

        function showNextItem() {
            console.log(`Switching from item ${currentIndex}`);
            items[currentIndex].style.display = 'none'; // Hide current item
            currentIndex = (currentIndex + 1) % totalItems; // Move to next item
            items[currentIndex].style.display = 'block'; // Show next item
            console.log(`Showing item ${currentIndex}`);
        }

        // Set interval to switch items every 4 seconds
        setInterval(showNextItem, 4000);
    } else {
        console.log('Only one carousel item found; skipping interval setup.');
    }

    document.querySelector('#durcForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let pageNumber = 1;
        const totalPagesOffset = [];

        let yesCount = 0;
        let noCount = 0;
        let unknownCount = 0;
        let unansweredCount = 0;

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Keputusan Imbasan DuRC - SelamatBio", 10, 10);

        doc.setFontSize(12);
        doc.text("Tarikh: " + new Date().toLocaleDateString(), 10, 20);

        doc.setFontSize(10);
        let yOffset = 40;

        // Select all question containers
        const questions = document.querySelectorAll('.question');

        // Count responses
        questions.forEach((questionDiv, index) => {
            const i = index + 1;

            let questionElement = questionDiv.querySelector(`input[name="question${i}"]:checked`);
            let answer = questionElement ? questionElement.value : "Tidak dijawab";

            switch (answer) {
                case 'Ya':
                    yesCount++;
                    break;
                case 'Tidak':
                    noCount++;
                    break;
                case 'Tidak Pasti / Tidak Diketahui':
                    answer = "Tidak diketahui"; // Replace with simpler answer
                    unknownCount++;
                    break;
                case 'Tidak dijawab':
                default:
                    unansweredCount++;
                    break;
            }
        });

        // Add the summary line after the date
        doc.text(`Bilangan soalan yang dijawab dengan Ya: ${yesCount}, Tidak: ${noCount}, Tidak diketahui: ${unknownCount}, Tidak dijawab: ${unansweredCount}`, 10, 30);

        // Reset yOffset after the summary
        yOffset = 40;

        // Function to render text with potential italic segments
        function renderTextWithItalic(doc, text, x, y) {
            const parts = text.split(/(<\/?i>)/g); // Split by <i> and </i>
            let currentX = x;

            parts.forEach((part) => {
                if (part === '<i>') {
                    doc.setFont("times", "italic");
                } else if (part === '</i>') {
                    doc.setFont("helvetica", "bold");
                } else {
                    doc.text(part, currentX, y);
                    currentX += doc.getTextWidth(part); // Adjust X position for next part
                }
            });
        }

        // Loop through all the question divs
        questions.forEach((questionDiv, index) => {
            const i = index + 1;  // To match the question number

            // Get the question title
            let questionTitleElement = questionDiv.querySelector('h3');
            let questionTitle = questionTitleElement ? questionTitleElement.innerHTML.replace(/^(\d+)\)\s*/, '') : `Question ${i}`;

            // Get the question prompt
            let questionPromptElement = questionDiv.querySelector('label');
            let questionPrompt = questionPromptElement ? questionPromptElement.innerText : "Prompt not found";

            // Get the selected answer
            let questionElement = questionDiv.querySelector(`input[name="question${i}"]:checked`);
            let answer = questionElement ? questionElement.value : "Tidak dijawab"; // Default answer

            // If the answer is "Tidak Pasti / Tidak Diketahui", replace it with "Tidak diketahui"
            if (answer === "Tidak Pasti / Tidak Diketahui") {
                answer = "Tidak diketahui";
            }

            // Set title text with different formatting
            doc.setFontSize(14); // Larger font size for title
            doc.setFont("helvetica", "bold");
            renderTextWithItalic(doc, `${i}. ${questionTitle}`, 10, yOffset);  // Render title with potential italics
            yOffset += 12; // Adjust yOffset to move below the title

            // Split the question prompt and answer into two columns
            doc.setFontSize(10); // Reset font size for question and answer
            doc.setFont("helvetica", "normal"); // Normal font for question and answer
            let questionColumn = doc.splitTextToSize(questionPrompt, 150);  // Width of first column
            let answerColumn = doc.splitTextToSize(answer, 30);  // Width of second column

            // Get the height required for the question and answer text
            const questionHeight = questionColumn.length * 3; // Approximate height based on line count
            const answerHeight = answerColumn.length * 3;

            // Set the rectangle height based on the largest text block
            let boxHeight = Math.max(questionHeight, answerHeight);

            // Determine the background color based on the answer
            let fillColor;
            switch (answer) {
                case 'Ya':
                    fillColor = [255, 204, 204];  // Light red
                    break;
                case 'Tidak':
                    fillColor = [204, 255, 204];  // Light green
                    break;
                case 'Tidak diketahui':
                    fillColor = [255, 255, 204];  // Light yellow
                    break;
                case 'Tidak dijawab':
                default:
                    fillColor = [220, 220, 220];  // Light grey
                    break;
            }

            // Set background color and draw the filled rectangle for the question and answer
            doc.setFillColor(...fillColor);
            doc.rect(10, yOffset - 4, 190, boxHeight + 4, 'F'); // Draw the filled rectangle with padding

            // Center the answer text in the second column for all answers
            const answerX = 170 + (30 / 2) - (doc.getTextDimensions(answer).w / 2);
            doc.text(answer, answerX, yOffset);  // Centered text in the second column

            // Print the question prompt in the first column
            doc.text(questionColumn, 12, yOffset);

            // Adjust yOffset based on the tallest text block
            yOffset += boxHeight + 10;

            // Add a page break if needed
            if (yOffset > 270) {
                totalPagesOffset.push(doc.internal.getCurrentPageInfo().pageNumber); // Save current page number
                doc.addPage();
                yOffset = 20; // Reset yOffset for the new page
            }
        });

        totalPagesOffset.push(doc.internal.getCurrentPageInfo().pageNumber); // Last page

        // Now add the footer to each page with the correct page numbers
        const totalPages = totalPagesOffset.length;

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addPageFooter(doc, i, totalPages);
        }

        // Save the PDF
        doc.save('durc_quickscan_results.pdf');

        // Add a delay before redirecting to ensure the download starts
        setTimeout(function() {
            window.open('durc-results.html', '_blank'); // Opens durc-results.html in a new tab
        }, 2000); // 2-second delay before redirecting

        // Function to add footer with page number
        function addPageFooter(doc, pageNum, totalPages) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Mukasurat ${pageNum} / ${totalPages}`, 200, 290, null, null, 'right');
        }
    });
});
