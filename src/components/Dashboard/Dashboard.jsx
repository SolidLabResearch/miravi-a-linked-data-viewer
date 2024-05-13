import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Title } from 'react-admin';
import PropTypes from 'prop-types';
import CustomEditor from './CustomQueryEditor/customEditor';
import './Dashboard.css';

/**
 * This function returns a function that creates a dashboard with an introduction for <Admin>.
 * @param {object} props - This has the properties `title` (text for the app bar) and `text` (the introduction text).
 * @returns {function(): *} - A function that creates a dashboard with an introduction for <Admin>.
 */
function Dashboard(props) {
  let { title, text } = props;

  title = title || 'You change this title via the config file.';
  text = text || 'You change this text via the config file.';

  return (
    <div>
      
      <CustomEditor/>
      <Card>
        <Title title={title} />
        <CardContent>{text}</CardContent>
      </Card>
      

    </div>
  );
}

Dashboard.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string
};

export default Dashboard;
