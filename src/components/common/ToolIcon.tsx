import React from 'react';
import {
  FileJson,
  Binary,
  Fingerprint,
  Clock,
  Palette,
  SearchCode,
  FileText,
  AlignLeft,
  Wrench,
} from 'lucide-react';

interface ToolIconProps {
  name: string;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'FileJson':
      return <FileJson className={className} />;
    case 'Binary':
      return <Binary className={className} />;
    case 'Fingerprint':
      return <Fingerprint className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'SearchCode':
      return <SearchCode className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'AlignLeft':
      return <AlignLeft className={className} />;
    default:
      return <Wrench className={className} />;
  }
};
