import React from 'react';

export const Card = ({ className, children, ...props }) => (
  <div className={`bg-white rounded-lg shadow-lg ${className}`} {...props}>{children}</div>
);

export const CardHeader = ({ className, children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>{children}</div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={`text-2xl font-bold ${className}`} {...props}>{children}</h3>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
);