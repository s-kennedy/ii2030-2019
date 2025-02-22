import React from "react";
import { graphql } from "gatsby";
import { connect } from "react-redux";
import { map } from "lodash";
import { updatePage, loadPageData } from "../redux/actions";

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import Layout from "../layouts/default.js";
import Section from "../layouts/Section";
import Title from "../components/editables/Title";
import Paragraph from "../components/editables/Paragraph";

const mapDispatchToProps = dispatch => {
  return {
    onUpdatePageData: (page, id, data) => {
      dispatch(updatePage(page, id, data));
    },
    onLoadPageData: data => {
      dispatch(loadPageData(data));
    }
  };
};

const mapStateToProps = state => {
  return {
    pageData: state.page.data,
    isEditingPage: state.adminTools.isEditingPage
  };
};

class FrequentlyAskedQuestions extends React.Component {
  componentDidMount() {
    const initialPageData = {
      ...this.props.data.pages,
      content: JSON.parse(this.props.data.pages.content)
    };

    this.props.onLoadPageData(initialPageData);
  }

  saveHandler = id => content => {
    this.props.onUpdatePageData("faqs", id, content);
  };

  addFaq = category => () => {
    const faqArray = [...this.props.pageData.content.questions];
    const emptyFaq = {
      question: { text: "Question" },
      answer: { text: "Answer" },
      category: category
    };
    faqArray.push(emptyFaq);

    this.props.onUpdatePageData("faqs", "questions", faqArray);
  };

  editFaq = (index, field) => content => {
    const faqArray = [...this.props.pageData.content.questions];
    const updatedFaq = {
      ...faqArray[index],
      [field]: content
    };

    faqArray[index] = updatedFaq;


    this.props.onUpdatePageData("faqs", "questions", faqArray);
  };

  deleteFaq = index => () => {
    const faqArray = [...this.props.pageData.content.questions];
    faqArray.splice(index, 1);

    this.props.onUpdatePageData("faqs", "questions", faqArray);
  };

  render() {
    const content = this.props.pageData ? this.props.pageData.content : {};
    const questions = content.questions || [];

    const categories = {
      "General Information": [],
      "Registration": [],
      "Tickets": [],
      "Partnerships & Sponsorship": []
    };

    questions.forEach((question, index) => {
      if (!categories[question.category]) {
        categories[question.category] = [];
      }
      question.position = index
      categories[question.category].push(question);
    });

    return (
      <Layout>
        <main>
          <Section id="basic-page">
            <header className="text-center">
              <Title
                level="h1"
                content={content["faqs-title"]}
                onSave={this.saveHandler("faqs-title")}
              />
            </header>

            {map(categories, (category, key) => {
              return (
                <div key={`category-${key}`}>
                  <Typography variant="headline" color="default">
                    {key}
                  </Typography>
                  {category.map((question, i) => (
                    <ExpansionPanel key={`category-${key}-question-${i}`}>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Title
                          level="h4"
                          content={question["question"]}
                          onSave={this.editFaq(question.position, "question")}
                        />
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <Paragraph
                          content={question["answer"]}
                          onSave={this.editFaq(question.position, "answer")}
                        />
                      </ExpansionPanelDetails>
                      {this.props.isEditingPage && (
                        <ExpansionPanelActions>
                          <Button
                            color="default"
                            onClick={this.deleteFaq(question.position)}
                          >
                            Delete
                          </Button>
                        </ExpansionPanelActions>
                      )}
                    </ExpansionPanel>
                  ))}
                  {this.props.isEditingPage && (
                    <Button
                      color="default"
                      variant="contained"
                      onClick={this.addFaq(key)}
                    >
                      Add question
                    </Button>
                  )}
                </div>
              );
            })}
          </Section>
        </main>
      </Layout>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  FrequentlyAskedQuestions
);

export const query = graphql`
  query {
    pages(id: { eq: "faqs" }) {
      id
      content
      title
      slug
    }
  }
`;
