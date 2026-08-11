import StatsRow from '../../components/StatsRow/StatsRow';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import ActivityList from '../../components/ActivityList/ActivityList';
import './PulpitPage.css';

export default function PulpitPage({
  statAvailable,
  statOut,
  statBroken,
  activity,
  onOpenIssue,
  onGoTeren,
}) {
  return (
    <div className="pulpit-page">
      <StatsRow available={statAvailable} out={statOut} broken={statBroken} />
      <ActionButtons onIssue={onOpenIssue} onGoTeren={onGoTeren} />
      <ActivityList items={activity} />
    </div>
  );
}
