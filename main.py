#!/usr/bin/env python3
"""
LocalPDFManager - A Zero-Telemetry, Standalone Offline Desktop Application
Built with PyQt6/PySide6 & PyMuPDF (fitz)
"""

import sys
import os
from PySide6.QtCore import Qt, QSize, QThread, Signal, Slot
from PySide6.QtGui import QImage, QPixmap, QIcon, QKeySequence, QShortcut, QLinearGradient, QColor, QPalette
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, 
    QPushButton, QListWidget, QListWidgetItem, QFileDialog, QMessageBox, 
    QLabel, QFrame, QProgressBar, QAbstractItemView
)

# Robust import for PyMuPDF
try:
    import fitz
except ImportError:
    print("Error: PyMuPDF is not installed. Please run: pip install pymupdf")
    sys.exit(1)


class PDFPageLoaderWorker(QThread):
    """
    Worker thread to load and render PDF pages in the background
    to keep the GUI responsive during heavy file loads.
    """
    page_rendered = Signal(str, int, QPixmap, int)  # file_path, page_num, pixmap, total_pages
    loading_finished = Signal()
    loading_error = Signal(str)

    def __init__(self, file_paths):
        super().__init__()
        self.file_paths = file_paths

    def run(self):
        for file_path in self.file_paths:
            try:
                # Open PDF document
                doc = fitz.open(file_path)
                total_pages = len(doc)
                
                for page_num in range(total_pages):
                    page = doc.load_page(page_num)
                    
                    # Render page as a thumbnail using a Matrix scale
                    zoom = 1.5  # Clear resolution
                    mat = fitz.Matrix(zoom, zoom)
                    pix = page.get_pixmap(matrix=mat)
                    
                    # Convert fitz.Pixmap safely to QPixmap
                    try:
                        # Direct raw memory mapping for maximum speed
                        ptr = pix.samples
                        qimg = QImage(ptr, pix.width, pix.height, pix.stride, QImage.Format_RGB888)
                    except Exception:
                        # Highly robust fallback using compressed PNG in-memory bytes
                        png_data = pix.tobytes("png")
                        qimg = QImage.fromData(png_data)
                    
                    # Convert to QPixmap
                    pixmap = QPixmap.fromImage(qimg)
                    
                    # Emit page details to update UI
                    self.page_rendered.emit(file_path, page_num, pixmap, total_pages)
                
                doc.close()
            except Exception as e:
                self.loading_error.emit(f"Failed to load '{os.path.basename(file_path)}': {str(e)}")
        
        self.loading_finished.emit()


class LocalPDFManager(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("LocalPDFManager — Desktop PDF Editor")
        self.resize(1100, 750)
        
        # Setup modern styling (dark violet futuristic glassmorphic palette)
        self.apply_theme()
        
        # Central Widget & Main Layout
        central_widget = QWidget()
        central_widget.setObjectName("centralWidget")
        self.setCentralWidget(central_widget)
        
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(16, 16, 16, 16)
        main_layout.setSpacing(16)
        
        # ==========================================
        # LEFT PANEL (Control Panel)
        # ==========================================
        control_panel = QFrame()
        control_panel.setObjectName("controlPanel")
        control_panel.setFixedWidth(260)
        
        control_layout = QVBoxLayout(control_panel)
        control_layout.setContentsMargins(16, 20, 16, 20)
        control_layout.setSpacing(14)
        
        # App Branding Header
        app_title = QLabel("LocalPDFManager")
        app_title.setStyleSheet("font-size: 20px; font-weight: bold; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;")
        control_layout.addWidget(app_title)
        
        app_subtitle = QLabel("100% Offline | Zero-Telemetry")
        app_subtitle.setStyleSheet("font-size: 11px; color: #787693; font-weight: 500;")
        control_layout.addWidget(app_subtitle)
        
        # Inline spacer line
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setStyleSheet("color: #2D2A43; background-color: #2D2A43; max-height: 1px;")
        control_layout.addWidget(line)
        
        control_layout.addSpacing(10)
        
        # Import Buttons Section
        btn_caption_1 = QLabel("MANAGE CHANNELS")
        btn_caption_1.setStyleSheet("font-size: 11px; color: #A6A3C0; font-weight: bold; letter-spacing: 1px;")
        control_layout.addWidget(btn_caption_1)
        
        self.btn_add_png = QPushButton("Add PNGs")
        self.btn_add_png.setObjectName("addPngBtn")
        self.btn_add_png.clicked.connect(self.add_pngs)
        control_layout.addWidget(self.btn_add_png)
        
        self.btn_add_pdf = QPushButton("Add PDF")
        self.btn_add_pdf.setObjectName("addPdfBtn")
        self.btn_add_pdf.clicked.connect(self.add_pdfs)
        control_layout.addWidget(self.btn_add_pdf)
        
        control_layout.addSpacing(10)
        
        # Manage Workspace Section
        btn_caption_2 = QLabel("EDIT WORKSPACE")
        btn_caption_2.setStyleSheet("font-size: 11px; color: #A6A3C0; font-weight: bold; letter-spacing: 1px;")
        control_layout.addWidget(btn_caption_2)
        
        self.btn_delete = QPushButton("Delete Selected")
        self.btn_delete.setObjectName("deleteBtn")
        self.btn_delete.clicked.connect(self.delete_selected)
        control_layout.addWidget(self.btn_delete)
        
        self.btn_clear = QPushButton("Clear Workspace")
        self.btn_clear.setObjectName("clearBtn")
        self.btn_clear.clicked.connect(self.clear_workspace)
        control_layout.addWidget(self.btn_clear)
        
        control_layout.addStretch()
        
        # Export Button (Stunning Violet Glow Pill)
        self.btn_export = QPushButton("Export to PDF")
        self.btn_export.setObjectName("exportBtn")
        self.btn_export.clicked.connect(self.export_to_pdf)
        control_layout.addWidget(self.btn_export)
        
        main_layout.addWidget(control_panel)
        
        # ==========================================
        # RIGTH AREA (WORKSPACE)
        # ==========================================
        workspace_layout = QVBoxLayout()
        workspace_layout.setSpacing(12)
        
        # Workspace Header Row
        header_row = QHBoxLayout()
        workspace_title = QLabel("PDF Workspace Pages")
        workspace_title.setStyleSheet("font-size: 18px; font-weight: bold; color: #E2E8F0;")
        header_row.addWidget(workspace_title)
        
        workspace_desc = QLabel("Drag & Drop cells to rearrange sequence")
        workspace_desc.setStyleSheet("font-size: 11px; color: #787693;")
        header_row.addStretch()
        header_row.addWidget(workspace_desc)
        workspace_layout.addLayout(header_row)
        
        # QListWidget set to IconMode for Thumbnail Grid (Rearrange items seamlessly)
        self.list_widget = QListWidget()
        self.list_widget.setObjectName("workspaceList")
        self.list_widget.setViewMode(QAbstractItemView.IconMode)
        self.list_widget.setResizeMode(QAbstractItemView.Adjust)
        self.list_widget.setMovement(QAbstractItemView.Snap)
        self.list_widget.setSelectionMode(QAbstractItemView.ExtendedSelection)
        
        # Enable complete drag-and-drop movement
        self.list_widget.setDragEnabled(True)
        self.list_widget.setAcceptDrops(True)
        self.list_widget.setDropIndicatorShown(True)
        self.list_widget.setDragDropMode(QAbstractItemView.InternalMove)
        
        # Grid sizes
        self.list_widget.setIconSize(QSize(120, 160))
        self.list_widget.setGridSize(QSize(148, 210))
        
        workspace_layout.addWidget(self.list_widget)
        
        # Bottom Status Bar / Panel
        self.statusBarPanel = QFrame()
        self.statusBarPanel.setObjectName("statusBarPanel")
        self.statusBarPanel.setFixedHeight(40)
        
        status_layout = QHBoxLayout(self.statusBarPanel)
        status_layout.setContentsMargins(12, 0, 12, 0)
        
        self.lbl_status = QLabel("Ready")
        self.lbl_status.setStyleSheet("color: #A1A1AA; font-size: 11px; font-family: monospace;")
        status_layout.addWidget(self.lbl_status)
        
        status_layout.addStretch()
        
        # In-line ProgressBar
        self.progress_bar = QProgressBar()
        self.progress_bar.setObjectName("statusProgressBar")
        self.progress_bar.setFixedWidth(200)
        self.progress_bar.setFixedHeight(8)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setVisible(False)
        status_layout.addWidget(self.progress_bar)
        
        self.lbl_page_count = QLabel("Total Pages: 0")
        self.lbl_page_count.setStyleSheet("color: #A1A1AA; font-size: 11px; font-weight: bold; font-family: monospace;")
        status_layout.addWidget(self.lbl_page_count)
        
        workspace_layout.addWidget(self.statusBarPanel)
        main_layout.addLayout(workspace_layout)
        
        # Add Delete key shortcut for convenient page removal
        self.del_shortcut = QShortcut(QKeySequence.Delete, self)
        self.del_shortcut.activated.connect(self.delete_selected)
        
        # Track worker threads
        self.loaders = []
        
        self.update_page_count()

    def apply_theme(self):
        """
        Applies a modern, high-contrast, dark-violet glassmorphic UI stylesheet (QSS)
        reflecting the exact style of the provided picture (neon purple-pink details,
        dark background tiles, clean dashboard structure, dashed container lines).
        """
        styles = """
            QMainWindow {
                background: #0F0E14;
            }
            #centralWidget {
                background-color: #0F0E14;
            }
            #controlPanel {
                background-color: #161521;
                border: 1px dashed #2E2A43;
                border-radius: 20px;
            }
            #workspaceList {
                background-color: #13121D;
                border: 2px dashed #2E2A43;
                border-radius: 20px;
                padding: 12px;
                color: #FFFFFF;
                outline: none;
            }
            #workspaceList::item {
                background-color: #191826;
                border: 1px solid #2E2A43;
                color: #E2E8F0;
                border-radius: 14px;
                margin: 4px;
                padding: 8px;
            }
            #workspaceList::item:hover {
                background-color: #242236;
                border: 1px solid #4D4570;
            }
            #workspaceList::item:selected {
                background-color: #372A5C;
                border: 1.5px solid #bd1d8c;
                color: #FFFFFF;
            }
            QPushButton {
                background-color: #1F1C2E;
                color: #E2E8F0;
                border: 1px solid #332E4A;
                border-radius: 18px;
                padding: 10px 16px;
                font-size: 12px;
                font-family: inherit;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2D2745;
                border-color: #4C3F6F;
            }
            QPushButton:pressed {
                background-color: #161224;
            }
            #deleteBtn {
                border-color: #551D30;
                color: #FF859F;
            }
            #deleteBtn:hover {
                background-color: #3B121E;
            }
            #clearBtn {
                border-color: #4C3C21;
                color: #FBBF24;
            }
            #clearBtn:hover {
                background-color: #332612;
            }
            #exportBtn {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                                            stop:0 #BD1D8C, stop:1 #671D9D);
                border: none;
                color: #FFFFFF;
                border-radius: 18px;
                padding: 12px 18px;
                font-size: 13px;
                font-weight: bold;
                min-height: 20px;
            }
            #exportBtn:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                                            stop:0 #D52AA2, stop:1 #7F2AC4);
            }
            #statusBarPanel {
                background-color: #13121D;
                border: 1px dashed #2E2A43;
                border-radius: 12px;
            }
            #statusProgressBar::chunk {
                background-color: #9333EA;
                border-radius: 4px;
            }
            #statusProgressBar {
                background-color: #1F1B2E;
                border: none;
                border-radius: 4px;
            }
        """
        self.setStyleSheet(styles)

    @Slot()
    def add_pngs(self):
        """Allows users to select multiple PNG files to import into the grid workspace."""
        file_paths, _ = QFileDialog.getOpenFileNames(
            self, "Import PNG Images", "", "Image Files (*.png)"
        )
        if not file_paths:
            return
        
        self.lbl_status.setText("Importing PNG files...")
        count = 0
        for path in file_paths:
            # Create a thumbnail directly using PySide's build-in loader
            pixmap = QPixmap(path)
            if pixmap.isNull():
                continue
                
            # Create and configure the List Widget Item
            filename = os.path.basename(path)
            item = QListWidgetItem()
            item.setText(filename)
            
            # Store Page metadata in custom roles
            item.setData(Qt.UserRole + 1, "png")       # File type
            item.setData(Qt.UserRole + 2, path)        # File origin
            item.setData(Qt.UserRole + 3, 0)           # Page num (default 0 for image)
            
            # Scale and set thumb icon
            scale_size = QSize(120, 160)
            scaled_pixmap = pixmap.scaled(scale_size, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            item.setIcon(QIcon(scaled_pixmap))
            
            self.list_widget.addItem(item)
            count += 1
            
        self.lbl_status.setText(f"Successfully added {count} PNG image(s).")
        self.update_page_count()

    @Slot()
    def add_pdfs(self):
        """Allows users to choose a PDF file, starting a background thread to import pages seamlessly."""
        file_paths, _ = QFileDialog.getOpenFileNames(
            self, "Import PDF Files", "", "PDF Files (*.pdf)"
        )
        if not file_paths:
            return
            
        self.lbl_status.setText("Preparing PDF files...")
        self.progress_bar.setVisible(True)
        self.progress_bar.setRange(0, 0)  # Pulse mode

        # Lock buttons
        self.set_interaction_enabled(False)

        # Build Worker thread
        worker = PDFPageLoaderWorker(file_paths)
        worker.page_rendered.connect(self.on_worker_page_rendered)
        worker.loading_error.connect(self.on_worker_error)
        worker.loading_finished.connect(self.on_worker_finished)
        
        self.loaders.append(worker)
        worker.start()

    @Slot(str, int, QPixmap, int)
    def on_worker_page_rendered(self, file_path, page_num, pixmap, total_pages):
        """Callback executed on page rendering completion in background thread."""
        filename = os.path.basename(file_path)
        item = QListWidgetItem()
        item.setText(f"Page {page_num + 1}\n{filename}")
        
        # Metadata storage
        item.setData(Qt.UserRole + 1, "pdf")
        item.setData(Qt.UserRole + 2, file_path)
        item.setData(Qt.UserRole + 3, page_num)
        
        # Scale & set icon
        scaled_pixmap = pixmap.scaled(QSize(120, 160), Qt.KeepAspectRatio, Qt.SmoothTransformation)
        item.setIcon(QIcon(scaled_pixmap))
        
        self.list_widget.addItem(item)
        self.update_page_count()

    @Slot(str)
    def on_worker_error(self, message):
        QMessageBox.critical(self, "PDF Loading Error", message)

    @Slot()
    def on_worker_finished(self):
        # Resolve finished worker
        for w in self.loaders:
            if w.isFinished():
                self.loaders.remove(w)
                
        self.progress_bar.setVisible(False)
        self.set_interaction_enabled(True)
        self.lbl_status.setText("PDF Loading completed successfully.")
        self.update_page_count()

    def set_interaction_enabled(self, enabled):
        self.btn_add_png.setEnabled(enabled)
        self.btn_add_pdf.setEnabled(enabled)
        self.btn_export.setEnabled(enabled)
        self.btn_clear.setEnabled(enabled)
        self.btn_delete.setEnabled(enabled)

    @Slot()
    def delete_selected(self):
        """Deletes chosen items in grid view workspace."""
        selected_items = self.list_widget.selectedItems()
        if not selected_items:
            return
            
        for item in selected_items:
            self.list_widget.takeItem(self.list_widget.row(item))
            
        self.lbl_status.setText(f"Deleted {len(selected_items)} page(s) from workspace.")
        self.update_page_count()

    @Slot()
    def clear_workspace(self):
        """Clears the whole list container."""
        if self.list_widget.count() == 0:
            return
            
        confirm = QMessageBox.question(
            self, "Clear Entire Workspace?", 
            "Are you sure you want to clear your working workspace? All current thumbnails will be discarded.",
            QMessageBox.Yes | QMessageBox.No
        )
        if confirm == QMessageBox.Yes:
            self.list_widget.clear()
            self.lbl_status.setText("Workspace cleared.")
            self.update_page_count()

    def update_page_count(self):
        cnt = self.list_widget.count()
        self.lbl_page_count.setText(f"Total Pages: {cnt}")

    @Slot()
    def export_to_pdf(self):
        """
        Compiles the current workspace in exact chronological sequence
        shown in the UI into a single output PDF, with ZERO temporary file clutter.
        """
        count = self.list_widget.count()
        if count == 0:
            QMessageBox.warning(self, "Empty Workspace", "No pages in your workspace. Add PNGs or PDFs first.")
            return
            
        output_path, _ = QFileDialog.getSaveFileName(
            self, "Save Unified PDF", "output.pdf", "PDF Documents (*.pdf)"
        )
        if not output_path:
            return
            
        self.lbl_status.setText("Exporting and compiling PDF...")
        self.progress_bar.setVisible(True)
        self.progress_bar.setRange(0, count)
        self.set_interaction_enabled(False)
        QApplication.processEvents()

        try:
            # Create a brand new empty PDF document in-memory
            output_doc = fitz.open()
            
            for i in range(count):
                item = self.list_widget.item(i)
                file_type = item.data(Qt.UserRole + 1)
                file_path = item.data(Qt.UserRole + 2)
                
                if file_type == "pdf":
                    page_num = item.data(Qt.UserRole + 3)
                    # Open original PDF document
                    src_doc = fitz.open(file_path)
                    # Insert specific PDF page cleanly (zero quality loss)
                    output_doc.insert_pdf(src_doc, from_page=page_num, to_page=page_num)
                    src_doc.close()
                elif file_type == "png":
                    # Convert PNG directly to PDF on the fly and stitch it
                    img_doc = fitz.open(file_path)
                    pdf_bytes = img_doc.convert_to_pdf()
                    temp_pdf = fitz.open("pdf", pdf_bytes)
                    output_doc.insert_pdf(temp_pdf)
                    img_doc.close()
                    temp_pdf.close()
                    
                self.progress_bar.setValue(i + 1)
                QApplication.processEvents()
                
            # Direct save to target file with maximal compression
            output_doc.save(output_path, garbage=3, deflate=True)
            output_doc.close()
            
            self.lbl_status.setText(f"Export successful! Saved: '{os.path.basename(output_path)}'")
            QMessageBox.information(
                self, "Export Completed", 
                f"Successfully compiled all {count} workspace items!\n\nSaved to:\n{output_path}"
            )
        except Exception as e:
            self.lbl_status.setText("Export failed.")
            QMessageBox.critical(self, "Export Failed", f"An error occurred while compiling PDF:\n{str(e)}")
        finally:
            self.progress_bar.setVisible(False)
            self.set_interaction_enabled(True)
            self.update_page_count()


def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    manager = LocalPDFManager()
    manager.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
