import React from 'react';
import { useAppRoute } from './hooks/useAppRoute';
import TaskPaneLayout from './components/TaskPaneLayout';
import { AppliedStep } from './types/routes';

const App: React.FC = () => {
  const [route] = useAppRoute();
  const [appliedSteps, setAppliedSteps] = React.useState<AppliedStep[]>([]);

  const handleChatSend = (message: string) => {
    setAppliedSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        label: `Message IA : « ${message.slice(0, 40)}${message.length > 40 ? '…' : ''} »`,
        view: route.view,
        timestamp: new Date(),
      },
    ]);
  };

  const handleStepApplied = (label: string) => {
    setAppliedSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}`,
        label,
        view: route.view,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <TaskPaneLayout
      route={route}
      appliedSteps={appliedSteps}
      onChatSend={handleChatSend}
      onStepApplied={handleStepApplied}
    />
  );
};

export default App;
