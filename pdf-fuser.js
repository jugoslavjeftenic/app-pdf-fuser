let files = [];

function addFile(file) {
	if (!file || file.type !== "application/pdf") return;
	files.push(file);
	renderFileList();
}

function renderFileList() {
	const list = document.getElementById("fileList");
	list.innerHTML = "";
	files.forEach((file, index) => {
		const li = document.createElement("li");
		li.draggable = true;
		li.dataset.index = index;

		li.innerHTML = `${file.name} <button class="remove-btn" onclick="removeFile(${index})">&#10006;</button>`;


		li.addEventListener("dragstart", (e) => {
			e.dataTransfer.setData("text/plain", index);
		});

		li.addEventListener("dragover", (e) => {
			e.preventDefault();
			li.style.backgroundColor = "#ddd";
		});

		li.addEventListener("dragleave", () => {
			li.style.backgroundColor = "#f0f0f0";
		});

		li.addEventListener("drop", (e) => {
			e.preventDefault();
			const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
			const toIndex = index;
			if (fromIndex !== toIndex) {
				const movedFile = files.splice(fromIndex, 1)[0];
				files.splice(toIndex, 0, movedFile);
				renderFileList();
			}
		});

		list.appendChild(li);
	});
}

function removeFile(index) {
	files.splice(index, 1);
	renderFileList();
}

document.getElementById('pdfInput').addEventListener('change', (event) => {
	const file = event.target.files[0];
	addFile(file);
	event.target.value = "";
});

const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", (e) => {
	e.preventDefault();
	dropZone.style.backgroundColor = "#eee";
});
dropZone.addEventListener("dragleave", () => {
	dropZone.style.backgroundColor = "";
});
dropZone.addEventListener("drop", (e) => {
	e.preventDefault();
	dropZone.style.backgroundColor = "";
	const file = e.dataTransfer.files[0];
	addFile(file);
});

async function mergePDFs() {
	if (files.length < 2) {
		alert("Dodaj bar 2 PDF fajla.");
		return;
	}

	const { PDFDocument } = PDFLib;
	const mergedPdf = await PDFDocument.create();

	for (let file of files) {
		const arrayBuffer = await file.arrayBuffer();
		const pdf = await PDFDocument.load(arrayBuffer);
		const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
		copiedPages.forEach((page) => mergedPdf.addPage(page));
	}

	const mergedPdfBytes = await mergedPdf.save();
	const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });

	const link = document.getElementById("downloadLink");
	link.href = URL.createObjectURL(blob);
	link.download = "spojeni.pdf";
	link.style.display = "inline";
	link.textContent = "Preuzmi spojeni PDF";
};
