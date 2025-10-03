import React from 'react';

function FileUpload({ onSelect, disabled }) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onSelect(file);
    }
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.jpg,.jpeg,.png"
      />
      <button
        className="btn-file"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        type="button"
      >
        📎
      </button>
    </div>
  );
}

export default FileUpload;
