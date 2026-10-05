package domain

type EducationCard struct {
	ID string
	Topic string
	Title string
	Fact string
	Calculation string
	Interpretation string
	Action string
}

func NewEducationCard(id, topic, title, fact, calculation, interpretation, action string) EducationCard {
	return EducationCard{ID:id, Topic:topic, Title:title, Fact:fact, Calculation:calculation, Interpretation:interpretation, Action:action}
}

func (c EducationCard) Valid() bool {
	return c.ID != "" && c.Topic != "" && c.Title != "" && c.Fact != "" && c.Calculation != "" && c.Interpretation != "" && c.Action != ""
}
