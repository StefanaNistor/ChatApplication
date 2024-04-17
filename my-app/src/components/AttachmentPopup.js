import React from "react";
import { useEffect, useState } from "react";


function AttachmentPopup(props) {
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    fetchAttachment();
  }, []);

  const fetchAttachment = async () => {
    
    setAttachment(null);
  };

  return (
    <div>
      <div img id='attachement' > </div>
      
    </div>
  );
}