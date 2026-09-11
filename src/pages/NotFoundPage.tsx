import React from 'react';
import { Link } from 'react-router-dom';
import { Heading, Paragraph, MonoLabel } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6 pointer-events-auto">
      <div className="max-w-md w-full text-center">
        <MonoLabel className="text-primary mb-2 block">COORDINATES UNKNOWN // 404</MonoLabel>
        <Heading level={1} className="text-3xl font-extrabold mb-3">
          Trajectory Lost
        </Heading>
        <Paragraph className="mb-6">
          The requested spatial sector does not exist on this journey spline.
        </Paragraph>
        <Link to="/">
          <Button variant="primary" className="gap-2">
            <Compass className="h-4 w-4" />
            <span>Return to Origin</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
