import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Title } from 'react-admin';
import './Dashboard.css';

import SaveCustomToPod from './saveCustomQueriesToPod/saveCustomToPod';

import configManager from '../../configManager/configManager';

/**
 * This function returns a function that creates a dashboard with an introduction for <Admin>.
 * @returns {function(): *} - A function that creates a dashboard with an introduction for <Admin>.
 */
function Dashboard() {
  const config = configManager.getConfig();
  const title = config.title || 'You change this title via the config file.';
  const introductionText = config.introductionText || 'You change this introduction text via the config file.';

  return (
    <div>
      <Card>
        <Title title={title} />
        <CardContent>{introductionText}</CardContent>
      </Card>

      <SaveCustomToPod/>
    </div>
  );
}

export default Dashboard;
